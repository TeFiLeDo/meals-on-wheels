use std::{
    collections::hash_map::DefaultHasher,
    fs::{create_dir_all, File, OpenOptions},
    hash::{Hash, Hasher},
    io::{BufReader, BufWriter, Seek, SeekFrom},
    path::PathBuf,
    sync::Mutex,
};

use crate::{
    data::{AvailableDatasets, Data},
    DATA, DATADIR, PROJECT_DIRS,
};
use chrono::Datelike;
use fs2::FileExt;
use ron::{de::from_reader, ser::to_writer};

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum GlobalCmd {
    /// Get a list of all available datasets.
    ///
    /// # Success variants
    /// - `GotDatasets`
    GetAvailableDatasets,
    /// Get the current state of the application.
    ///
    /// # Success variants
    /// - `GotState`
    GetState,
    /// Create a new dataset
    ///
    /// # Success variants
    /// - `CreatedDataset`
    ///
    /// # Error variants
    /// - `DatasetExists`: if a dataset for the month/year combination already exists in the data
    ///   dir
    /// - `DatasetIsActive`: if there is already an active dataset
    /// - `IoError`: if the corresponding files can't be opened
    /// - `LockError`: if the corresponding files can't be locked
    #[serde(rename_all = "camelCase")]
    NewDataset {
        /// Specifies the month the dataset should be created for.
        ///
        /// # Values
        /// - `false`: the dataset is created for the current month
        /// - `true`: the dataset is created for the next month
        next_month: bool,
    },
    /// Open an existing dataset
    ///
    /// # Success variants
    /// - `OpenedDataset`
    ///
    /// # Error variants
    /// - `DatasetIsActive`: if there is already an active dataset
    /// - `IoError`: if the corresponding files can't be opened
    /// - `LockError`: if the corresponding files can't be locked
    /// - `NoDataset`: if there is no such dataset
    #[serde(rename_all = "camelCase")]
    OpenDataset {
        /// The year the dataset is in.
        year: i32,
        /// The month the dataset if for.
        month: u32,
    },
    /// Save the loaded dataset to disk
    ///
    /// # Success variants
    /// - `Saved`
    ///
    /// # Error variants
    /// - `DatasetNotActive`: if there isn't an active dataset
    /// - `IoError`
    /// - `RonError`
    Save,
}

#[derive(Debug, thiserror::Error)]
pub enum GlobalCmdError {
    #[error("error.global.dataset_exists")]
    DatasetExists,
    #[error("error.global.dataset_is_active")]
    DatasetIsActive,
    #[error("error.global.dataset_not_active")]
    DatasetNotActive,
    #[error("error.global.io: {0}")]
    IoError(#[from] std::io::Error),
    #[error("error.global.lock")]
    LockError,
    #[error("error.global.no_dataset")]
    NoDataset,
    #[error("error.global.ron: {0}")]
    RonError(#[from] ron::Error),
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum GlobalCmdSuccess {
    CreatedDataset,
    GotDatasets(AvailableDatasets),
    GotState {
        state: State,
    },
    OpenedDataset {
        /// true, if the year and month within the file don't match up with its file name
        mismatch: bool,
    },
    Saved,
}

impl super::CmdAble for GlobalCmd {
    type Error = GlobalCmdError;
    type Success = GlobalCmdSuccess;

    fn execute(self: Self) -> Result<Self::Success, Self::Error> {
        match self {
            Self::GetAvailableDatasets => Ok(GlobalCmdSuccess::GotDatasets(
                AvailableDatasets::from_base_dir(&dataset_file_name),
            )),
            Self::GetState => {
                let data = DATA.read().expect("failed to get data read access");

                let ret = match &*data {
                    None => State::Select,
                    Some((val, _)) => State::Loaded {
                        year: val.year,
                        month: val.month,
                    },
                };

                Ok(Self::Success::GotState { state: ret })
            }
            Self::NewDataset { next_month } => {
                let now = chrono::Local::now().date();

                // calculate month and year for new dataset
                let month = if !next_month {
                    now.month()
                } else {
                    now.month() + 1 % 12
                };
                let year = if !next_month {
                    now.year()
                } else {
                    if month != 1 {
                        now.year()
                    } else {
                        now.year() + 1
                    }
                };

                // check if dataset already exists
                if dataset_file_name(year, month).is_file() {
                    return Err(Self::Error::DatasetExists);
                }

                // open data var
                let mut data = DATA.write().expect("failed to get data write lock");
                if data.is_some() {
                    return Err(Self::Error::DatasetIsActive);
                }

                // set data var
                *data = Some((Data::new(year, month), Mutex::new(open_files(year, month)?)));

                Ok(Self::Success::CreatedDataset)
            }
            Self::OpenDataset { year, month } => {
                if month < 1 || month > 12 {
                    return Err(Self::Error::NoDataset);
                }

                let mut data = DATA.write().expect("failed to get data write lock");
                if data.is_some() {
                    return Err(Self::Error::DatasetIsActive);
                }

                // open files
                let (file, tmp) = open_files(year, month)?;

                // get data from file
                // TODO: check for data in tmp file
                let new_data: Data;
                {
                    let file = BufReader::new(&file);
                    new_data = from_reader(file).map_err(|e| Self::Error::RonError(e))?;
                }

                // check for mismatch
                let mismatch = new_data.year != year || new_data.month != month;

                *data = Some((new_data, Mutex::new((file, tmp))));

                Ok(Self::Success::OpenedDataset { mismatch })
            }
            Self::Save => {
                if let Some((data, files)) = &*DATA.read().expect("failed to get data read lock") {
                    let files = files.lock().expect("failet to get file lock");
                    let (mut file, mut tmp) = (&files.0, &files.1);

                    // write data to tmp
                    {
                        let tmp = BufWriter::new(tmp);
                        to_writer(tmp, &data).map_err(|e| Self::Error::RonError(e))?;
                    }

                    // write data to file
                    {
                        // clear file before writing
                        file.set_len(0).map_err(|e| Self::Error::IoError(e))?;
                        file.seek(SeekFrom::Start(0))
                            .map_err(|e| Self::Error::IoError(e))?;

                        let file = BufWriter::new(file);
                        to_writer(file, &data).map_err(|e| Self::Error::RonError(e))?;
                    }

                    // clear tmp file
                    tmp.set_len(0).map_err(|e| Self::Error::IoError(e))?;
                    tmp.seek(SeekFrom::Start(0))
                        .map_err(|e| Self::Error::IoError(e))?;

                    Ok(Self::Success::Saved)
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}

/// Open the permanent and temporary file and set the DATA variable.
fn open_files(year: i32, month: u32) -> Result<(File, File), GlobalCmdError> {
    let file = dataset_file_name(year, month);
    if let Some(x) = file.parent() {
        create_dir_all(x).map_err(|e| GlobalCmdError::IoError(e))?;
    }
    let file = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(file)
        .map_err(|e| GlobalCmdError::IoError(e))?;
    file.lock_exclusive()
        .map_err(|_| GlobalCmdError::LockError)?;

    let tmp = dataset_tmp_name(year, month);
    if let Some(x) = tmp.parent() {
        create_dir_all(x).map_err(|e| GlobalCmdError::IoError(e))?;
    }
    let tmp = OpenOptions::new()
        .read(true)
        .write(true)
        .create(true)
        .open(tmp)
        .map_err(|e| GlobalCmdError::IoError(e))?;
    tmp.lock_exclusive()
        .map_err(|_| GlobalCmdError::LockError)?;

    Ok((file, tmp))
}

/// Get the name of the file for a specific date
fn dataset_file_name(year: i32, month: u32) -> PathBuf {
    let mut file = DATADIR.clone();
    file.push(year.to_string());
    file.push(month.to_string());
    file.set_extension("ron");

    file
}

/// Get the name of a tmp file for a specific date
fn dataset_tmp_name(year: i32, month: u32) -> PathBuf {
    let mut hasher = DefaultHasher::new();
    DATADIR.hash(&mut hasher);

    let mut file = PROJECT_DIRS.cache_dir().to_path_buf();
    file.push(hasher.finish().to_string());
    file.push(year.to_string());
    file.push(month.to_string());
    file.set_extension("ron.tmp");

    file
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum State {
    Select,
    Loaded { year: i32, month: u32 },
}
