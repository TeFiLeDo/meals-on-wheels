#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cmd;
mod data;

use dotenv::dotenv;
use std::sync::Arc;
use tauri::execute_promise;

lazy_static::lazy_static! {
    static ref PROJECT_DIRS: Arc<directories::ProjectDirs> =Arc::new(
        directories::ProjectDirs::from("dev", "tfld", "Meals on Wheels")
            .expect("unable to find default directories")
    );
}

fn main() {
    #[cfg(debug_assertions)]
    dotenv().expect("dotenv loading failed");

    tauri::AppBuilder::new()
        .invoke_handler(|webview, arg| {
            use cmd::Cmd::*;
            match serde_json::from_str(arg) {
                Err(e) => Err(e.to_string()),
                Ok(command) => {
                    match command {
                        GGetAvailableMonths { callback, error } => execute_promise(
                            webview,
                            || {
                                let dirs = Arc::clone(&PROJECT_DIRS);
                                Ok(data::AvailableMonths::from_base_dir(&data::get_base_dir(
                                    &dirs,
                                )))
                            },
                            callback,
                            error,
                        ),
                        GGetState { callback, error } => execute_promise(
                            webview,
                            || Ok(cmd::global::get_state::State::Select),
                            callback,
                            error,
                        ),
                    }
                    Ok(())
                }
            }
        })
        .build()
        .run();
}
