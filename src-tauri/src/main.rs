#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod cmd;
mod data;

use data::Data;
use dotenv::dotenv;
use std::sync::RwLock;

lazy_static::lazy_static! {
    static ref PROJECT_DIRS: directories::ProjectDirs =
        directories::ProjectDirs::from("dev", "tfld", "Meals on Wheels")
        .expect("unable to find default directories");
    static ref DATA: RwLock<Option<Data>> = RwLock::new(None);
}

fn main() {
    #[cfg(debug_assertions)]
    dotenv().expect("dotenv loading failed");

    tauri::AppBuilder::new()
        .invoke_handler(|webview, arg| match serde_json::from_str(arg) {
            Err(e) => Err(e.to_string()),
            Ok(command) => {
                let cmd: cmd::Cmd = command;
                cmd.execute(webview)
            }
        })
        .build()
        .run();
}
