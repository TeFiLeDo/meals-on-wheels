import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  Button,
  Table,
  Label,
  Header,
  Segment,
  Input,
} from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../../error";

export default function EditModal(props) {
  const { t } = useTranslation();
  const [newVariant, setNewVariant] = useState("");
  const [newOption, setNewOption] = useState("");

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
        <Header
          as="h4"
          content={t("views.components.edit.variants_title", {
            name: props.data.name,
          })}
          attached="top"
        />
        <Segment attached>
          <Input
            value={newVariant}
            onChange={(_, { value }) => setNewVariant(value)}
            fluid
            placeholder={t("views.components.edit.variants_add")}
            action={{
              content: t("views.components.edit.variants_add_action"),
              icon: "plus",
              labelPosition: "left",
              color: "positive",
              onClick: () => {
                promisified({
                  cmd: "component",
                  sub: {
                    cmd: "addVariant",
                    component: props.uuid,
                    name: newVariant,
                  },
                })
                  .then((r) => {
                    if (
                      handle_unexpected_variant("addedVariant", r.variant, t)
                    ) {
                      setNewVariant("");
                      props.onEdit();
                    }
                  })
                  .catch((e) => handle_error(e, t));
              },
            }}
          />
        </Segment>
        <Table striped celled attached="bottom">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content={t("views.components.edit.variants")} />
              <Table.HeaderCell content={t("views.components.edit.actions")} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.entries(props.data.variants).map(([k, v]) => {
              return (
                <Table.Row>
                  <Table.Cell>{v.name}</Table.Cell>
                  <Table.Cell collapsing></Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        <Header
          as="h4"
          content={t("views.components.edit.options_title", {
            name: props.data.name,
          })}
          attached="top"
        />
        <Segment attached>
          <Input
            value={newOption}
            onChange={(_, { value }) => setNewOption(value)}
            fluid
            placeholder={t("views.components.edit.options_add")}
            action={{
              content: t("views.components.edit.options_add_action"),
              icon: "plus",
              labelPosition: "left",
              color: "positive",
              onClick: () => {
                promisified({
                  cmd: "component",
                  sub: {
                    cmd: "addOption",
                    component: props.uuid,
                    name: newOption,
                  },
                })
                  .then((r) => {
                    if (
                      handle_unexpected_variant("addedOption", r.variant, t)
                    ) {
                      setNewOption("");
                      props.onEdit();
                    }
                  })
                  .catch((e) => handle_error(e, t));
              },
            }}
          />
        </Segment>
        <Table striped celled attached="bottom">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content={t("views.components.edit.options")} />
              <Table.HeaderCell content={t("views.components.edit.actions")} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {Object.entries(props.data.options).map(([k, v]) => {
              return (
                <Table.Row>
                  <Table.Cell>
                    {v.name}{" "}
                    {v.delete ? (
                      <Label
                        icon="trash"
                        content={t("views.components.edit.deleted")}
                        color="red"
                      />
                    ) : null}
                  </Table.Cell>
                  <Table.Cell collapsing></Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
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
