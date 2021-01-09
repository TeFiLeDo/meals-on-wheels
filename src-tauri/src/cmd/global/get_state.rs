/// Global application state
#[derive(Debug, serde::Serialize)]
#[serde(tag = "state", rename_all = "camelCase")]
pub enum State {
    /// The user has yet to select a data set
    Select,
}
