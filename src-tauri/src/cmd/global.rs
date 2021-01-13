use crate::{
    data::{get_base_dir, AvailableDatasets},
    DATA, PROJECT_DIRS,
};

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum GlobalCmd {
    /// Get a list of all available datasets.
    GetAvailableDatasets,
    /// Get the current state of the application.
    GetState,
}

#[derive(Debug, thiserror::Error)]
pub enum GlobalCmdError {}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum GlobalCmdSuccess {
    GotDatasets(AvailableDatasets),
    GotState { state: State },
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

                let ret = match *data {
                    None => State::Select,
                    _ => panic!("data must be 'none'"),
                };

                Ok(Self::Success::GotState { state: ret })
            }
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum State {
    Select,
}
