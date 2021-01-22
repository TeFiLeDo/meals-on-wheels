use std::collections::BTreeMap;

use uuid::Uuid;

use flattened::component;

use crate::flattened;

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

    pub fn flatten(data: &BTreeMap<Uuid, Self>) -> Vec<component::Component> {
        data.iter().map(|e| e.into()).collect()
    }
}

impl From<(&Uuid, &Component)> for component::Component {
    fn from((uuid, data): (&Uuid, &Component)) -> Self {
        match data {
            Component {
                name,
                delete,
                variants,
                options,
            } => Self {
                uuid: uuid.clone(),
                name: name.clone(),
                delete: delete.clone(),
                variants: variants.iter().map(|e| e.into()).collect(),
                options: options.iter().map(|e| e.into()).collect(),
            },
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

impl From<(&Uuid, &ComponentVariant)> for component::Variant {
    fn from((uuid, data): (&Uuid, &ComponentVariant)) -> Self {
        match data {
            ComponentVariant { name, delete } => Self {
                uuid: uuid.clone(),
                name: name.clone(),
                delete: delete.clone(),
            },
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

impl From<(&Uuid, &ComponentOption)> for component::Option {
    fn from((uuid, data): (&Uuid, &ComponentOption)) -> Self {
        match data {
            ComponentOption { name, delete } => Self {
                uuid: uuid.clone(),
                name: name.clone(),
                delete: delete.clone(),
            },
        }
    }
}
