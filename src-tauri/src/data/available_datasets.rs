use chrono::{Datelike, Local};
use std::{
    collections::{BTreeMap, HashSet},
    path::PathBuf,
};

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AvailableDatasets {
    data: BTreeMap<i32, HashSet<u32>>,
    current_year: Option<i32>,
    current_month: Option<u32>,
    can_create_now: bool,
    can_create_next: bool,
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
    pub fn from_base_dir(file_name_format: &dyn Fn(i32, u32) -> PathBuf) -> Self {
        let mut datasets = BTreeMap::new();
        let now = Local::now().date();

        // check past years and current year
        for y in 1970..(now.year() + 1) {
            let datasets_year = Self::find_year_until(
                y,
                if y == now.year() {
                    if now.month() == 12 {
                        12
                    } else {
                        now.month() + 1
                    }
                } else {
                    12
                },
                file_name_format,
            );

            if datasets_year.len() > 0 {
                datasets.insert(y, datasets_year);
            }
        }

        // check next january if current month is december
        if now.month() == 12 {
            if file_name_format(now.year() + 1, 1).is_file() {
                let mut datasets_next_year = HashSet::new();
                datasets_next_year.insert(1);
                datasets.insert(now.year() + 1, datasets_next_year);
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

        // check if current and next month can be created
        let can_create_now = match datasets.get(&now.year()) {
            None => true,
            Some(x) => !x.contains(&now.month()),
        };
        let can_create_next = if now.month() != 12 {
            match datasets.get(&now.year()) {
                None => true,
                Some(x) => !x.contains(&(now.month() + 1)),
            }
        } else {
            match datasets.get(&(now.year() + 1)) {
                None => true,
                Some(x) => !x.contains(&1),
            }
        };

        Self {
            current_year,
            current_month,
            data: datasets,
            can_create_now,
            can_create_next,
        }
    }

    /// Find all datasets within a year
    fn find_year_until(
        year: i32,
        until: u32,
        file_name_format: &dyn Fn(i32, u32) -> PathBuf,
    ) -> HashSet<u32> {
        assert!(
            until >= 1 && until <= 12,
            "until parameter isn't valid month ({})",
            until
        );

        let mut data = HashSet::new();
        for month in 1..(until + 1) {
            if file_name_format(year, month).is_file() {
                data.insert(month);
            }
        }

        data
    }
}
