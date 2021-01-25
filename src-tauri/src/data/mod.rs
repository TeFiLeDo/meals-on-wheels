mod available_datasets;
pub mod component;
pub use available_datasets::AvailableDatasets;
use std::collections::BTreeMap;
use uuid::Uuid;

/// Struct to hold all application data
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Data {
    /// The year the data applies to.
    pub year: i32,
    /// The month the data applies to.
    pub month: u32,
    /// The available meal components.
    pub components: BTreeMap<Uuid, component::Component>,
}

impl Data {
    pub fn new(year: i32, month: u32) -> Self {
        Self {
            year,
            month,
            components: BTreeMap::new(),
        }
    }
}
