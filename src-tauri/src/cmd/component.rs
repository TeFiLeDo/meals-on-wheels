use crate::{
    data::{Component, ComponentOption, ComponentVariant},
    DATA,
};
use std::collections::BTreeMap;
use uuid::Uuid;

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum ComponentCmd {
    /// Adds a new component.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::AddedComponent`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    AddComponent {
        name: String,
        variants: Vec<String>,
        options: Vec<String>,
    },
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum ComponentCmdSuccess {
    AddedComponent,
}

#[derive(Debug, thiserror::Error)]
pub enum ComponentCmdError {
    #[error("error.global.dataset_not_active")]
    DatasetNotActive,
}

impl super::CmdAble for ComponentCmd {
    type Error = ComponentCmdError;
    type Success = ComponentCmdSuccess;

    fn execute(self: Self) -> Result<Self::Success, Self::Error> {
        match self {
            Self::AddComponent {
                name,
                variants,
                options,
            } => {
                let mut v = BTreeMap::new();
                for variant in variants {
                    v.insert(Uuid::new_v4(), ComponentVariant::new(variant));
                }

                let mut o = BTreeMap::new();
                for option in options {
                    o.insert(Uuid::new_v4(), ComponentOption::new(option));
                }

                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    data.components
                        .insert(Uuid::new_v4(), Component::new(name, v, o));

                    dbg!(data);

                    Ok(Self::Success::AddedComponent)
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}
