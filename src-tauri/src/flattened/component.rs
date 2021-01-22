use uuid::Uuid;

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Component {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
    pub variants: Vec<Variant>,
    pub options: Vec<Option>,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Variant {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
}

#[derive(Debug, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Option {
    pub uuid: Uuid,
    pub name: String,
    pub delete: bool,
}
