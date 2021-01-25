use std::collections::BTreeMap;
use uuid::Uuid;
use crate::data::component as data;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
    pub variants: Vec<Variant>,
    pub options: Vec<Option>,
}

impl Component {
    pub fn from(data: &BTreeMap<Uuid, data::Component>) -> Vec<Self> {
        data.iter().map(|e| e.into()).collect()
    }
}

impl From<(&Uuid, &data::Component)> for Component {
    fn from((uuid, data): (&Uuid, &data::Component)) -> Self {
        match data {
            data::Component {
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

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Variant {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
}

impl From<(&Uuid, &data::Variant)> for Variant {
    fn from((uuid, data): (&Uuid, &data::Variant)) -> Self {
        match data {
            data::Variant { name, delete } => Self {
                uuid: uuid.clone(),
                name: name.clone(),
                delete: delete.clone(),
            },
        }
    }
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Option {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
}

impl From<(&Uuid, &data::Option)> for Option {
    fn from((uuid, data): (&Uuid, &data::Option)) -> Self {
        match data {
            data::Option { name, delete } => Self {
                uuid: uuid.clone(),
                name: name.clone(),
                delete: delete.clone(),
            },
        }
    }
}
