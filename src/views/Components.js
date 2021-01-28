import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Header, Icon, Segment, Button, Table } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import EditModal from "../components/components/EditModal";
import NewModal from "../components/components/NewModal";
import { handle_unexpected_variant } from "../error";

export default function Components() {
  const { t } = useTranslation();
  const [newDialog, setNewDialog] = useState(false);
  const [editor, setEditor] = useState({ open: false, uuid: null });
  const [components, setComponents] = useState({ loading: true, data: [] });

  useEffect(() => {
    update(setComponents, t);
  }, [setComponents, t]);

  return (
    <React.Fragment>
      <Header as="h2" attached="top">
        <Icon name="puzzle piece" />
        <Header.Content>{t("views.components.list.title")}</Header.Content>
      </Header>
      <Segment attached>
        <Button
          primary
          icon
          labelPosition="left"
          onClick={() => setNewDialog(true)}
        >
          <Icon name="plus" />
          {t("views.components.list.add")}
        </Button>
      </Segment>
      <Table striped attached="bottom">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              {t("views.components.list.column_name")}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {t("views.components.list.column_variants")}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {t("views.components.list.column_options")}
            </Table.HeaderCell>
            <Table.HeaderCell>
              {t("views.components.list.column_actions")}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(components.data).map(([k, v]) => {
            return (
              <Table.Row key={k}>
                <Table.Cell>{v.name}</Table.Cell>
                <Table.Cell>{Object.keys(v.variants).length}</Table.Cell>
                <Table.Cell>{Object.keys(v.options).length}</Table.Cell>
                <Table.Cell>
                  <Button
                    icon="pencil"
                    title={t("views.components.edit.tooltip")}
                    onClick={() => {
                      setEditor((e) => {
                        return {
                          ...e,
                          open: true,
                          uuid: k,
                        };
                      });
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <NewModal
        open={newDialog}
        onAdded={() => {
          update(setComponents, t);
        }}
        onClose={() => {
          setNewDialog(false);
        }}
      />

      {editor.uuid !== null ? (
        <EditModal
          open={editor.open}
          uuid={editor.uuid}
          data={components.data[editor.uuid]}
          onClose={() =>
            setEditor((e) => {
              return { ...e, open: false, uuid: null };
            })
          }
          onEdit={() => update(setComponents, t)}
        />
      ) : null}
    </React.Fragment>
  );
}

function update(setComponents, t) {
  promisified({ cmd: "component", sub: { cmd: "getComponents" } })
    .then((r) => {
      if (handle_unexpected_variant("gotComponents", r.variant, t)) {
        setComponents((c) => {
          return { ...c, loading: false, data: r.data };
        });
      }
    })
    .catch((e) => {
      setComponents((c) => {
        return { ...c, loading: false, data: [] };
      });
    });
}
