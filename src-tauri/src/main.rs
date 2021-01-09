#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cmd;
mod data;

use data::Data;
use dotenv::dotenv;
use std::sync::{Arc, RwLock};
use tauri::execute_promise;

lazy_static::lazy_static! {
    static ref PROJECT_DIRS: Arc<directories::ProjectDirs> =Arc::new(
        directories::ProjectDirs::from("dev", "tfld", "Meals on Wheels")
            .expect("unable to find default directories")
    );
    static ref DATA: Arc<RwLock<Option<Data>>> = Arc::new(RwLock::new(None));
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
                        GGetAvailableDatasets { callback, error } => execute_promise(
                            webview,
                            || {
                                let dirs = Arc::clone(&PROJECT_DIRS);
                                Ok(data::AvailableDatasets::from_base_dir(&data::get_base_dir(
                                    &dirs,
                                )))
                            },
                            callback,
                            error,
                        ),
                        GGetState { callback, error } => execute_promise(
                            webview,
                            || {
                                let d = DATA.read().expect("failed to get read access to data");

                                Ok(match *d {
                                    None => "select",
                                    Some(_) => panic!("data must be 'none'"),
                                })
                            },
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
