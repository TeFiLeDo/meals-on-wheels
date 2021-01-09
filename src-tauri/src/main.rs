#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cmd;

use dotenv::dotenv;
use tauri::execute_promise;

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
                                Ok(cmd::global::get_available_months::get_available_months(
                                    &std::env::var("MOW_BASEDIR").unwrap_or("~".to_string()),
                                ))
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
