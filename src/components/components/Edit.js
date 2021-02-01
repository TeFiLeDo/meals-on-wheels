import { useTranslation } from "react-i18next";
import { Modal, Button } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../../error";
import ListEditor from "../ListEditor";

export default function Edit(props) {
  const { t } = useTranslation();

  if (props.data === null) {
    console.error("data provided to component editor mustn't be 'null'");
    return <></>;
  }

  return (
    <Modal open={props.open} onClose={() => props.onClose()}>
      <Modal.Header
        content={t("views.components.edit.title", { name: props.data.name })}
      />
      <Modal.Content>
        <ListEditor
          header={{ as: "h3" }}
          data={props.data.variants}
          title={t("views.components.edit.variants_title", {
            name: props.data.name,
          })}
          itemTitle={t("views.components.edit.variants")}
          addPlaceholder={t("views.components.edit.variants_add")}
          addAction={t("views.components.edit.variants_add_action")}
          onAdd={(data, setData) =>
            promisified({
              cmd: "component",
              sub: { cmd: "addVariant", component: props.uuid, name: data },
            })
              .then((r) => {
                if (handle_unexpected_variant("addedVariant", r.variant, t)) {
                  props.onEdit();
                  setData("");
                }
              })
              .catch((e) => handle_error(e, t))
          }
          noItems={t("views.components.edit.variants_none")}
        />

        <ListEditor
          header={{ as: "h3" }}
          data={props.data.options}
          title={t("views.components.edit.options_title", {
            name: props.data.name,
          })}
          itemTitle={t("views.components.edit.options")}
          addPlaceholder={t("views.components.edit.options_add")}
          addAction={t("views.components.edit.variants_add_action")}
          onAdd={(data, setData) =>
            promisified({
              cmd: "component",
              sub: { cmd: "addOption", component: props.uuid, name: data },
            })
              .then((r) => {
                if (handle_unexpected_variant("addedOption", r.variant, t)) {
                  props.onEdit();
                  setData("");
                }
              })
              .catch((e) => handle_error(e, t))
          }
          noItems={t("views.components.edit.options_none")}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={t("button.ok")}
          icon="check"
          labelPosition="left"
          primary
          onClick={() => {
            if (props.onClose !== null) {
              props.onClose();
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  );
}
