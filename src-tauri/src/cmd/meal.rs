use crate::{data::meal::Meal, DATA};
use std::collections::BTreeMap;
use uuid::Uuid;

#[derive(Debug, serde::Deserialize)]
#[serde(tag = "cmd", rename_all = "camelCase")]
pub enum MealCmd {
    /// Adds a new meal.
    ///
    /// # Success variants
    /// - [`MealCmdSuccess::AddedMeal`]
    ///
    /// # Error variants
    /// - [`MealCmdError::DatasetNotActive`]: if there is no active dataset
    /// - [`MealCmdError::EmptyName`]: if the provided name is empty
    /// - [`MealCmdError::ComponentNotFound`]: if a provided component doesn't exist
    /// - [`MealCmdError::VariantNotFound`]: if a provided variant doesn't exist
    AddMeal {
        name: String,
        short: String,
        components: BTreeMap<Uuid, Option<Uuid>>,
    },
}

#[derive(Debug, serde::Serialize)]
#[serde(tag = "variant", rename_all = "camelCase")]
pub enum MealCmdSuccess {
    AddedMeal,
}

#[derive(Debug, thiserror::Error)]
pub enum MealCmdError {
    #[error("error.meals.component_not_found")]
    ComponentNotFound,
    #[error("error.global.dataset_not_active")]
    DatasetNotActive,
    #[error("error.meals.name_empty")]
    EmptyName,
    #[error("error.meals.short_empty")]
    EmptyShort,
    #[error("error.meals.variant_not_found")]
    VariantNotFound,
}

impl super::CmdAble for MealCmd {
    type Error = MealCmdError;
    type Success = MealCmdSuccess;

    fn execute(self: Self) -> Result<Self::Success, Self::Error> {
        match self {
            Self::AddMeal {
                name,
                short,
                components,
            } => {
                let name = name.trim();
                if name.is_empty() {
                    return Err(Self::Error::EmptyName);
                }

                let short = short.trim();
                if short.is_empty() {
                    return Err(Self::Error::EmptyShort);
                }

                if let Some((data, _)) =
                    &mut *DATA.write().expect("failed to get data write access")
                {
                    for (k, v) in &components {
                        if data.components.contains_key(k) {
                            if let Some(v) = v {
                                if !data.components[k].variants.contains_key(v) {
                                    return Err(Self::Error::VariantNotFound);
                                }
                            }
                        } else {
                            return Err(Self::Error::ComponentNotFound);
                        }
                    }

                    let name = name.to_string();
                    let short = short.to_string();
                    data.meals
                        .insert(Uuid::new_v4(), Meal::new(name, short, components));

                    dbg!(data);

                    Ok(Self::Success::AddedMeal)
                } else {
                    Err(Self::Error::DatasetNotActive)
                }
            }
        }
    }
}
