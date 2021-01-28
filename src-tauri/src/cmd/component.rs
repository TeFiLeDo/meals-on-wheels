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
    /// Marks an option for removal or removes it.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::RemovedOption`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    /// - [`ComponentCmdError::NotFound`]: if the specified component can't be found
    /// - [`ComponentCmdError::DoesNotExist`]: if the option didn't exist in the first place
    /// - [`ComponentCmdError::StillInUse`]: if the option is in active use.
    RemoveOption { component: Uuid, option: Uuid },
    /// Marks a variant for removal or removes it.
    ///
    /// # Success variants
    /// - [`ComponentCmdSuccess::RemovedVariant`]
    ///
    /// # Error variants
    /// - [`ComponentCmdError::DatasetNotActive`]: if there is no active dataset
    /// - [`ComponentCmdError::NotFound`]: if the specified component can't be found
    /// - [`ComponentCmdError::DoesNotExist`]: if the variant didn't exist in the first place
    /// - [`ComponentCmdError::StillInUse`]: if the variant is in active use.
    RemoveVariant { component: Uuid, variant: Uuid },
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
    RemovedOption {
        /// Marks whether the removal was executed immediately or scheduled for the next dataset
        /// creation.
        ///
        /// # Values
        /// - `false`: The variant isn't referenced anywhere else within the dataset. It has been
        ///   removed immediately.
        /// - `true`: The variant isn't in active use anymore, but is still referenced within the
        ///   dataset. It will be stripped once the next dataset is created.
        scheduled: bool,
    },
    RemovedVariant {
        /// Marks whether the removal was executed immediately or scheduled for the next dataset
        /// creation.
        ///
        /// # Values
        /// - `false`: The variant isn't referenced anywhere else within the dataset. It has been
        ///   removed immediately.
        /// - `true`: The variant isn't in active use anymore, but is still referenced within the
        ///   dataset. It will be stripped once the next dataset is created.
        scheduled: bool,
    },
}

#[derive(Debug, thiserror::Error)]
pub enum ComponentCmdError {
    #[error("error.components.not_found")]
    NotFound,
    #[error("error.global.dataset_not_active")]
    DatasetNotActive,
    #[error("error.components.does_not_exist")]
    DoesNotExist,
    #[error("error.components.name_empty")]
    EmptyName,
    #[error("error.components.still_in_use")]
    StillInUse,
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
            Self::RemoveOption { component, option } => {
                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    // TODO: check for active uuid references
                    if false {
                        // is still used
                        Err(Self::Error::StillInUse)
                    } else {
                        // is no longer used

                        // TODO: check for passive uuid references
                        if let Some(component) = data.components.get_mut(&component) {
                            if true {
                                if let Some(option) = component.options.get_mut(&option) {
                                    option.delete = true;

                                    Ok(Self::Success::RemovedOption { scheduled: true })
                                } else {
                                    Err(Self::Error::DoesNotExist)
                                }
                            } else {
                                match component.options.remove(&option) {
                                    Some(_) => {
                                        Ok(Self::Success::RemovedOption { scheduled: false })
                                    }
                                    None => Err(Self::Error::DoesNotExist),
                                }
                            }
                        } else {
                            Err(Self::Error::NotFound)
                        }
                    }
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
            Self::RemoveVariant { component, variant } => {
                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    // TODO: check for active uuid references
                    if false {
                        // is still used
                        Err(Self::Error::StillInUse)
                    } else {
                        // is no longer used

                        // TODO: check for passive uuid references
                        if let Some(component) = data.components.get_mut(&component) {
                            if true {
                                if let Some(variant) = component.variants.get_mut(&variant) {
                                    variant.delete = true;

                                    Ok(Self::Success::RemovedVariant { scheduled: true })
                                } else {
                                    Err(Self::Error::DoesNotExist)
                                }
                            } else {
                                match component.variants.remove(&variant) {
                                    Some(_) => {
                                        Ok(Self::Success::RemovedVariant { scheduled: false })
                                    }
                                    None => Err(Self::Error::DoesNotExist),
                                }
                            }
                        } else {
                            Err(Self::Error::NotFound)
                        }
                    }
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}
