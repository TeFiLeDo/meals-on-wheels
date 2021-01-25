use std::collections::BTreeMap;
use uuid::Uuid;

/// Struct to hold a single component of a menu.
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct Component {
    pub name: String,
    pub delete: bool,
    pub variants: BTreeMap<Uuid, Variant>,
    pub options: BTreeMap<Uuid, Option>,
}

impl Component {
    pub fn new(
        name: String,
        variants: BTreeMap<Uuid, Variant>,
        options: BTreeMap<Uuid, Option>,
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
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct Variant {
    pub name: String,
    pub delete: bool,
}

impl Variant {
    pub fn new(name: String) -> Self {
        Self {
            name,
            delete: false,
        }
    }
}

/// Struct to hold a single component option.
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct Option {
    pub name: String,
    pub delete: bool,
}

impl Option {
    pub fn new(name: String) -> Self {
        Self {
            name,
            delete: false,
        }
    }
}
