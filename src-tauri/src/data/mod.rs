mod available_datasets;

pub use available_datasets::{get_base_dir, AvailableDatasets};

/// Struct to hold all application data
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Data {}
