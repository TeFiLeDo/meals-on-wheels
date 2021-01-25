import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Form,
  Header,
  Icon,
  Segment,
  Select,
  Button,
  Message,
  Table,
  Modal,
} from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_unexpected_variant } from "../error";

export default function Components() {
  const { t } = useTranslation();
  const [newComponent, setNewComponent] = useState({
    name: "",
    open: false,
    variants: [],
    variantsAvailable: [],
    options: [],
    optionsAvailable: [],
    error: "",
  });
  const [available, setAvailable] = useState({ variants: [], options: [] });
  const [components, setComponents] = useState({ loading: true, data: [] });

  useEffect(() => {
    update(setComponents, t);
  }, [setComponents, t]);

  useEffect(() => {
    setAvailable(getAvailableVandO(components.data));
  }, [components, setAvailable]);

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
          onClick={() =>
            setNewComponent((nc) => {
              return { ...nc, open: true };
            })
          }
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
              <Table.Row>
                <Table.Cell>{v.name}</Table.Cell>
                <Table.Cell>{Object.keys(v.variants).length}</Table.Cell>
                <Table.Cell>{Object.keys(v.options).length}</Table.Cell>
                <Table.Cell>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>

      <Modal open={newComponent.open}>
        <Modal.Header content={t("views.components.add.title")} />
        <Modal.Content>
          <Form error={newComponent.error.length > 0}>
            <Message
              error
              icon="exclamation triangle"
              header={t("error.occurred")}
              content={t(newComponent.error)}
            />
            <Form.Input
              label={t("views.components.add.name_label")}
              placeholder={t("views.components.add.name_placeholder")}
              value={newComponent.name}
              onChange={(_, e) => {
                setNewComponent((nc) => {
                  return { ...nc, name: e.value };
                });
              }}
              error={
                newComponent.name.trim().length > 0
                  ? false
                  : t("views.components.add.name_error_empty")
              }
            />
            <Message
              icon="info circle"
              info
              header={t("views.components.add.name_warning_title")}
              content={t("views.components.add.name_warning_content")}
            />
            <Form.Group widths="equal">
              <Form.Field
                label={t("views.components.variants")}
                placeholder={t("views.components.add.variants_placeholder")}
                noResultsMessage={t("views.components.add.variants_none")}
                additionLabel={t("views.components.add.variants_new")}
                control={Select}
                options={available.variants}
                value={newComponent.variants}
                onAddItem={(_, { value }) =>
                  setAvailable((a) => {
                    return {
                      ...a,
                      variants: [...a.variants, { text: value, value }],
                    };
                  })
                }
                onChange={(_, { value }) =>
                  setNewComponent((nc) => {
                    return { ...nc, variants: value };
                  })
                }
                multiple
                search
                selection
                allowAdditions
              />
              <Form.Field
                label={t("views.components.options")}
                placeholder={t("views.components.add.options_placeholder")}
                noResultsMessage={t("views.components.add.options_none")}
                additionLabel={t("views.components.add.options_new")}
                control={Select}
                options={available.options}
                value={newComponent.options}
                onAddItem={(_, { value }) =>
                  setAvailable((a) => {
                    return {
                      ...a,
                      options: [...a.options, { text: value, value }],
                    };
                  })
                }
                onChange={(_, { value }) =>
                  setNewComponent((nc) => {
                    return { ...nc, options: value };
                  })
                }
                multiple
                search
                selection
                allowAdditions
              />
            </Form.Group>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={t("button.cancel")}
            labelPosition="left"
            icon="trash"
            negative
            onClick={() =>
              setNewComponent((nc) => {
                return {
                  ...nc,
                  name: "",
                  open: false,
                  variants: [],
                  options: [],
                  error: "",
                };
              })
            }
          />
          <Button
            content={t("views.components.add.add")}
            labelPosition="left"
            icon="plus"
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
                  update(setComponents, t);
                  return r;
                })
                .then((r) => {
                  if (
                    handle_unexpected_variant("addedComponent", r.variant, t)
                  ) {
                    setNewComponent((nc) => {
                      return {
                        ...nc,
                        name: "",
                        open: false,
                        variants: [],
                        options: [],
                        error: "",
                      };
                    });
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

function getAvailableVandO(data) {
  let variants = [];
  let options = [];

  for (var d in data) {
    for (var v in data[d].variants) {
      let variant = data[d].variants[v].name;

      if (!variants.includes(variant)) {
        variants.push({ text: variant, value: variant });
      }
    }
    for (var o in data[d].options) {
      let option = data[d].options[o].name;

      if (!options.includes(option)) {
        options.push({ text: option, value: option });
      }
    }
  }

  return { variants, options };
}
