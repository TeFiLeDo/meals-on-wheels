use std::{collections::BTreeMap, iter::FromIterator};
use uuid::Uuid;

/// Struct to hold a meal
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct Meal {
    pub name: String,
    pub short: String,
    pub delete: bool,
    pub components: BTreeMap<Uuid, MealComponent>,
}

impl Meal {
    pub fn new(name: String, short: String, components: BTreeMap<Uuid, Option<Uuid>>) -> Self {
        Self {
            name,
            short,
            delete: false,
            components: BTreeMap::from_iter(
                components
                    .into_iter()
                    .map(|(k, v)| (k, MealComponent::new(v))),
            ),
        }
    }
}

/// Struct to hold connection from meal to component
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct MealComponent {
    pub variant: Option<Uuid>,
    pub delete: bool,
}

impl MealComponent {
    pub fn new(variant: Option<Uuid>) -> Self {
        Self {
            variant,
            delete: false,
        }
    }
}
