use crate::{
    data::component::{Component, Option, Variant},
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
    /// - [`ComponentCmdError::EmptyName`]: if the specified name is empty
    AddComponent {
        name: String,
        variants: Vec<String>,
        options: Vec<String>,
    },
    /// Adds a new option.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::AddedOption`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    /// - [`ComponentCmdError::EmptyName`]: if the specified name is empty
    AddOption { component: Uuid, name: String },
    /// Adds a new variant.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::AddedVariant`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    /// - [`ComponentCmdError::EmptyName`]: if the specified name is empty
    AddVariant { component: Uuid, name: String },
    /// Gets all components.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::GotComponents`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    GetComponents,
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum ComponentCmdSuccess {
    AddedComponent,
    AddedOption,
    AddedVariant,
    GotComponents {
        data: BTreeMap<Uuid, Component>,
    },
}

#[derive(Debug, thiserror::Error)]
pub enum ComponentCmdError {
    #[error("error.components.not_found")]
    NotFound,
    #[error("error.global.dataset_not_active")]
    DatasetNotActive,
    #[error("error.components.name_empty")]
    EmptyName,
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
                let name = name.trim();
                if name.is_empty() {
                    return Err(Self::Error::EmptyName);
                }

                let mut v = BTreeMap::new();
                for variant in variants {
                    v.insert(Uuid::new_v4(), Variant::new(variant));
                }

                let mut o = BTreeMap::new();
                for option in options {
                    o.insert(Uuid::new_v4(), Option::new(option));
                }

                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    data.components
                        .insert(Uuid::new_v4(), Component::new(name.to_string(), v, o));

                    Ok(Self::Success::AddedComponent)
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
            Self::AddOption { component, name } => {
                let name = name.trim();

                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    if let Some(component) = data.components.get_mut(&component) {
                        for (_, v) in &component.options {
                            if v.name == name {
                                return Ok(Self::Success::AddedOption);
                            }
                        }

                        component
                            .options
                            .insert(Uuid::new_v4(), Option::new(name.to_string()));

                        Ok(Self::Success::AddedOption)
                    } else {
                        Err(Self::Error::NotFound)
                    }
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
            Self::AddVariant { component, name } => {
                let name = name.trim();

                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    if let Some(component) = data.components.get_mut(&component) {
                        for (_, v) in &component.variants {
                            if v.name == name {
                                return Ok(Self::Success::AddedVariant);
                            }
                        }

                        component
                            .variants
                            .insert(Uuid::new_v4(), Variant::new(name.to_string()));

                        Ok(Self::Success::AddedVariant)
                    } else {
                        Err(Self::Error::NotFound)
                    }
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
            Self::GetComponents => {
                if let Some((data, _)) = &*DATA.read().expect("failed to get data read access") {
                    Ok(Self::Success::GotComponents {
                        data: data.components.clone(),
                    })
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}
