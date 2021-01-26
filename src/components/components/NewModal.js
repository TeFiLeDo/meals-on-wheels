import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Form,
  FormGroup,
  Message,
  Modal,
  Select,
} from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_unexpected_variant } from "../../error";

export default function NewModal(props) {
  const { t } = useTranslation();
  const [newComponent, setNewComponent] = useState({
    name: "",
    variants: [],
    variantsAvailable: [],
    options: [],
    optionsAvailable: [],
    error: "",
  });

  useEffect(() => {
    if (props.open === false) {
      setNewComponent((nc) => {
        return {
          ...nc,
          name: "",
          variants: [],
          options: [],
          error: "",
        };
      });
    }
  }, [props.open]);

  return (
    <Modal open={props.open}>
      <Modal.Header content={t("views.components.add.title")} />

      <Modal.Content>
        <Form error={newComponent.error.trim().length > 0}>
          <Message
            error
            icon="exclamation triangle"
            header={t("error.occurred")}
            content={t([newComponent.error, "error.undefined"])}
          />
          <Form.Input
            label={t("views.components.add.name_label")}
            placeholder={t("views.components.add.name_placeholder")}
            value={newComponent.name}
            onChange={(_, { value }) => {
              setNewComponent((nc) => {
                return { ...nc, name: value };
              });
            }}
            error={
              newComponent.name.trim().length > 0
                ? false
                : t("views.components.add.name_error_empty")
            }
          />
          <Message
            info
            icon="info circle"
            header={t("views.components.add.name_warning_title")}
            content={t("views.components.add.name_warning_content")}
          />

          <FormGroup widths="equal">
            <Form.Field
              label={t("views.components.variants")}
              placeholder={t("views.components.add.variants_placeholder")}
              control={Select}
              value={newComponent.variants}
              options={newComponent.variantsAvailable}
              onAddItem={(_, { value }) => {
                setNewComponent((nc) => {
                  return {
                    ...nc,
                    variantsAvailable: [
                      ...nc.variantsAvailable,
                      { text: value, value },
                    ],
                  };
                });
              }}
              onChange={(_, { value }) =>
                setNewComponent((nc) => {
                  return { ...nc, variants: value };
                })
              }
              multiple
              search
              selection
              allowAdditions
              noResultsMessage={t("views.components.add.variants_none")}
              additionLabel={t("views.components.add.variants_new")}
            />
            <Form.Field
              label={t("views.components.options")}
              placeholder={t("views.components.add.options_placeholder")}
              control={Select}
              value={newComponent.options}
              options={newComponent.optionsAvailable}
              onAddItem={(_, { value }) => {
                setNewComponent((nc) => {
                  return {
                    ...nc,
                    optionsAvailable: [
                      ...nc.optionsAvailable,
                      { text: value, value },
                    ],
                  };
                });
              }}
              onChange={(_, { value }) =>
                setNewComponent((nc) => {
                  return { ...nc, options: value };
                })
              }
              multiple
              search
              selection
              allowAdditions
              noResultsMessage={t("views.components.add.options_none")}
              additionLabel={t("views.components.add.options_new")}
            />
          </FormGroup>
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button
          content={t("button.cancel")}
          icon="trash"
          labelPosition="left"
          negative
          onClick={() => {
            if (props.onClose !== null) {
              props.onClose();
            }
          }}
        />
        <Button
          content={t("views.components.add.add")}
          icon="plus"
          labelPosition="left"
          positive
          onClick={() => {
            promisified({
              cmd: "component",
              sub: {
                cmd: "addComponent",
                name: newComponent.name,
                variants: newComponent.variants,
                options: newComponent.options,
              },
            })
              .then((r) => {
                if (handle_unexpected_variant("addedComponent", r.variant, t)) {
                  console.log("not cleared");
                }
              })
              .then(() => {
                if (props.onAdded !== null) {
                  props.onAdded();
                }
              })
              .then(() => {
                if (props.onClose !== null) {
                  props.onClose();
                }
              })
              .catch((e) =>
                setNewComponent((nc) => {
                  return {
                    ...nc,
                    error: e,
                  };
                })
              );
          }}
        />
      </Modal.Actions>
    </Modal>
  );
}
