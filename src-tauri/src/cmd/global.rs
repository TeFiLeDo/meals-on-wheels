use std::{
    fs::{rename, File},
    io::BufWriter,
    path::PathBuf,
};

use crate::{
    data::{dataset_exists, get_base_dir, AvailableDatasets, Data},
    DATA, PROJECT_DIRS,
};
use chrono::Datelike;
use ron::ser::{to_writer_pretty, PrettyConfig};

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
    /// -`DatasetExists`: if a dataset for the month/year combination already exists in the data dir
    /// - `DatasetIsActive`: if there is already an active dataset
    #[serde(rename_all = "camelCase")]
    NewDataset {
        /// Specifies the month the dataset should be created for.
        ///
        /// # Values
        /// - `false`: the dataset is created for the current month
        /// - `true`: the dataset is created for the next month
        next_month: bool,
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
    #[error("a dataset for this year and month already exists")]
    DatasetExists,
    #[error("there already is an opened dataset")]
    DatasetIsActive,
    #[error("there isn't an active dataset")]
    DatasetNotActive,
    #[error("io error")]
    IoError(#[from] std::io::Error),
    #[error("ron error")]
    RonError(#[from] ron::Error),
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum GlobalCmdSuccess {
    CreatedDataset,
    GotDatasets(AvailableDatasets),
    GotState { state: State },
    Saved,
}

impl super::CmdAble for GlobalCmd {
    type Error = GlobalCmdError;
    type Success = GlobalCmdSuccess;

    fn execute(self: Self) -> Result<Self::Success, Self::Error> {
        match self {
            Self::GetAvailableDatasets => Ok(GlobalCmdSuccess::GotDatasets(
                AvailableDatasets::from_base_dir(&get_base_dir(&PROJECT_DIRS)),
            )),
            Self::GetState => {
                let data = DATA.read().expect("failed to get data read access");

                let ret = match &*data {
                    None => State::Select,
                    Some(val) => State::Loaded {
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
                if dataset_exists(&get_base_dir(&PROJECT_DIRS), year, month) {
                    return Err(Self::Error::DatasetExists);
                }

                {
                    let mut data = DATA.write().expect("failed to get data write access");

                    if let Some(_) = *data {
                        return Err(Self::Error::DatasetIsActive);
                    }

                    *data = Some(Data::new(year, month));
                }

                Ok(Self::Success::CreatedDataset)
            }
            Self::Save => {
                let data = DATA.read().expect("failed to get data read access");

                if let Some(x) = &*data {
                    let path = format!(
                        "{}/{}/{}.ron",
                        get_base_dir(&PROJECT_DIRS)
                            .to_str()
                            .expect("invalid unicode character in path"),
                        x.year,
                        x.month
                    );
                    let temp_path = format!("{}.tmp", path);

                    let file = File::create(PathBuf::from(&temp_path))
                        .map_err(|e| Self::Error::IoError(e))?;

                    let writer = BufWriter::new(file);

                    to_writer_pretty(writer, x, PrettyConfig::new())
                        .map_err(|e| Self::Error::RonError(e))?;

                    rename(temp_path, path).map_err(|e| Self::Error::IoError(e))?;

                    Ok(Self::Success::Saved)
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum State {
    Select,
    Loaded { year: i32, month: u32 },
}
