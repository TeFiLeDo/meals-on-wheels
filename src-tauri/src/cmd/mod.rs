pub mod global;

use serde::Deserialize;

#[derive(Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    /// Get a list of all available months.
    GGetAvailableMonths {
        callback: String,
        error: String,
    },
    /// Get the current state of the application.
    GGetState {
        callback: String,
        error: String,
    },
}
