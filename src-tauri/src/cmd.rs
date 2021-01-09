use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    /// Get a list of all available months.
    GGetAvailableDatasets {
        callback: String,
        error: String,
    },
    /// Get the current state of the application.
    GGetState {
        callback: String,
        error: String,
    },
}
