use chrono::{Datelike, Local};
use std::collections::{BTreeMap, HashSet};

/// Get all months for which a data file exists within `base_dir`.
///
/// # Params
/// - `base_dir`: searches for data files in this directory. Should be absolute.
///
/// # Search limits
/// The first month checked is January 1970, the last month is the month after the current local
/// month.
pub fn get_available_months(base_dir: &str) -> BTreeMap<i32, HashSet<u32>> {
    let mut months = BTreeMap::new();
    let now = Local::now().date();

    // check past years and current year
    for y in 1970..(now.year() + 1) {
        let mut year = HashSet::new();

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
            if file_exists(base_dir, y, m) {
                year.insert(m);
            }
        }

        if year.len() > 0 {
            months.insert(y, year);
        }
    }

    // check next january if current month is december
    if now.month() == 12 {
        if file_exists(base_dir, now.year() + 1, 1) {
            let mut year = HashSet::new();
            year.insert(1);
            months.insert(now.year() + 1, year);
        }
    }

    months
}

/// Checks wether a data file exists within a directory structure
fn file_exists(base_dir: &str, year: i32, month: u32) -> bool {
    std::path::PathBuf::from(format!("{}/{}/{}.ron", base_dir, year, month)).is_file()
}
