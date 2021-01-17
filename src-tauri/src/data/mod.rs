mod available_datasets;

pub use available_datasets::AvailableDatasets;

/// Struct to hold all application data
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Data {
    /// The year the data applies to.
    pub year: i32,
    /// The month the data applies to.
    pub month: u32,
}

impl Data {
    pub fn new(year: i32, month: u32) -> Self {
        Self { year, month }
    }
}
