import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header, Input, Table } from "semantic-ui-react";

export default function ListEditor(props) {
  const { t } = useTranslation();
  const [add, setAdd] = useState("");

  return (
    <>
      <Header
        content={
          "title" in props ? props.title : t("components.list_editor.title")
        }
        attached="top"
        {...props.header}
      />
      <Table striped attached="bottom">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              content={
                "itemTitle" in props
                  ? props.itemTitle
                  : t("components.list_editor.items_title")
              }
            />
            <Table.HeaderCell content={t("components.list_editor.actions")} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.keys(props.data).length > 0 ? (
            Object.entries(props.data).map(([k, v]) => {
              return (
                <Table.Row>
                  <Table.Cell content={v.name.trim().length > 0 ? v.name : k} />
                  <Table.Cell collapsing />
                </Table.Row>
              );
            })
          ) : (
            <Table.Row>
              <Table.Cell colSpan={2} textAlign="center">
                {"noItems" in props
                  ? props.noItems
                  : t("components.list_editor.no_items")}
              </Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={2}>
              <Input
                value={add}
                onChange={(_, { value }) => setAdd(value)}
                fluid
                placeholder={
                  "addPlaceholder" in props
                    ? props.addPlaceholder
                    : t("components.list_editor.add_placeholder")
                }
                action={{
                  content:
                    "addAction" in props
                      ? props.addAction
                      : t("components.list_editor.add_action"),
                  icon: "plus",
                  labelPosition: "left",
                  color: "positive",
                  onClick: () => {
                    "onAdd" in props
                      ? props.onAdd(add, setAdd)
                      : console.warn("no onAdd specified");
                  },
                }}
              />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    </>
  );
}
