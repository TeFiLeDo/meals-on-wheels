use std::collections::BTreeMap;

use uuid::Uuid;

/// Struct to hold a single component of a menu.
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct Component {
    name: String,
    delete: bool,
    variants: BTreeMap<Uuid, ComponentVariant>,
    options: BTreeMap<Uuid, ComponentOption>,
}

impl Component {
    pub fn new(
        name: String,
        variants: BTreeMap<Uuid, ComponentVariant>,
        options: BTreeMap<Uuid, ComponentOption>,
    ) -> Self {
        Self {
            name,
            delete: false,
            variants,
            options,
        }
    }
}

/// Struct to hold a single component variant.
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct ComponentVariant {
    name: String,
    delete: bool,
}

impl ComponentVariant {
    pub fn new(name: String) -> Self {
        Self {
            name,
            delete: false,
        }
    }
}

/// Struct to hold a single component option.
#[derive(Debug, serde::Deserialize, serde::Serialize)]
pub struct ComponentOption {
    name: String,
    delete: bool,
}

impl ComponentOption {
    pub fn new(name: String) -> Self {
        Self {
            name,
            delete: false,
        }
    }
}
