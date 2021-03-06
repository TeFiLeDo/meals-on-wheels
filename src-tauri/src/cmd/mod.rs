pub mod component;
pub mod global;
pub mod meal;

use tauri::execute_promise;

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum Cmd {
    Component {
        sub: component::ComponentCmd,
        callback: String,
        error: String,
    },
    Global {
        sub: global::GlobalCmd,
        callback: String,
        error: String,
    },
    Meal {
        sub: meal::MealCmd,
        callback: String,
        error: String,
    },
}

impl Cmd {
    pub fn execute(self, webview: &mut tauri::Webview) -> Result<(), String> {
        match self {
            Self::Component {
                sub,
                callback: success_callback,
                error: error_callback,
            } => execute_promise(
                webview,
                || sub.execute().map_err(|e| e.into()),
                success_callback,
                error_callback,
            ),
            Self::Global {
                sub,
                callback: success_callback,
                error: error_callback,
            } => execute_promise(
                webview,
                || sub.execute().map_err(|e| e.into()),
                success_callback,
                error_callback,
            ),
            Self::Meal {
                sub,
                callback: success_callback,
                error: error_callback,
            } => execute_promise(
                webview,
                || sub.execute().map_err(|e| e.into()),
                success_callback,
                error_callback,
            ),
        };

        Ok(())
    }
}

pub trait CmdAble {
    type Error: std::error::Error;
    type Success: serde::Serialize;

    fn execute(self: Self) -> Result<Self::Success, Self::Error>;
}
