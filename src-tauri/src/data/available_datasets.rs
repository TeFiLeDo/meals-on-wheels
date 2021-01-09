use chrono::{Datelike, Local};
use std::{
    collections::{BTreeMap, HashSet},
    path::{Path, PathBuf},
};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AvailableDatasets {
    data: BTreeMap<i32, HashSet<u32>>,
    current_year: Option<i32>,
    current_month: Option<u32>,
}

impl AvailableDatasets {
    /// Get all months for which a data file exists within `base_dir`.
    ///
    /// # Params
    /// - `base_dir`: searches for data files in this directory. Should be absolute.
    ///
    /// # Search limits
    /// The first month checked is January 1970, the last month is the month after the current local
    /// month.
    pub fn from_base_dir(base_dir: &Path) -> Self {
        let mut datasets = BTreeMap::new();
        let now = Local::now().date();

        // check past years and current year
        for y in 1970..(now.year() + 1) {
            let mut datasets_year = HashSet::new();

            for m in 1..(if y == now.year() {
                if now.month() == 12 {
                    12
                } else {
                    now.month() + 1
                }
            } else {
                12
            } + 1)
            {
                if dataset_exists(base_dir, y, m) {
                    datasets_year.insert(m);
                }
            }

            if datasets_year.len() > 0 {
                datasets.insert(y, datasets_year);
            }
        }

        // check next january if current month is december
        if now.month() == 12 {
            if dataset_exists(base_dir, now.year() + 1, 1) {
                let mut dataset = HashSet::new();
                dataset.insert(1);
                datasets.insert(now.year() + 1, dataset);
            }
        }

        // check if current year and month exist as dataset
        let current_year = if datasets.contains_key(&now.year()) {
            Some(now.year())
        } else {
            None
        };
        let current_month = match current_year {
            None => None,
            Some(x) => match datasets.get(&x) {
                None => None,
                Some(x) => {
                    if x.contains(&now.month()) {
                        Some(now.month())
                    } else {
                        None
                    }
                }
            },
        };

        Self {
            current_year,
            current_month,
            data: datasets,
        }
    }
}

/// Find the appropriate data dir
pub fn get_base_dir(project_dirs: &directories::ProjectDirs) -> PathBuf {
    match std::env::var("MOW_DATADIR") {
        Ok(x) => PathBuf::from(x),
        Err(_) => project_dirs.data_dir().to_path_buf(),
    }
}

/// Checks wether a dataset exists within a directory structure
pub fn dataset_exists(base_dir: &Path, year: i32, month: u32) -> bool {
    std::path::PathBuf::from(format!(
        "{}/{}/{}.ron",
        base_dir
            .to_str()
            .expect("invalid unicode character in path"),
        year,
        month
    ))
    .is_file()
}
