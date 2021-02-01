import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Message, Modal, Select, Table } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../../error";

const init = {
  name: "",
  short: "",
  components: {},
  error: "",
};

function isInit(val) {
  return (
    val.name === init.name &&
    val.short === init.short &&
    val.components === init.components &&
    val.error === init.error
  );
}

const initCmp = {
  cmp: null,
  variant: null,
};

export default function New(props) {
  const { t } = useTranslation();
  const [val, setVal] = useState({ ...init });
  const [cmp, setCmp] = useState(initCmp);

  useEffect(() => {
    if (props.open === false) {
      setVal((nm) => {
        return { ...nm, ...init };
      });
      setCmp(initCmp);
    }
  }, [props.open, setVal, setCmp]);

  let aC = availableComponents(props.components, val.components);

  return (
    <Modal
      open={props.open}
      onClose={() =>
        "onClose" in props
          ? isInit(val)
            ? props.onClose()
            : () => {}
          : console.warn('no onClose for "new meal" dialog')
      }
    >
      <Modal.Header content={t("views.meals.add.title")} />

      <Modal.Content>
        <Form error={val.error.trim().length > 0}>
          <Message
            error
            icon="exclamation triangle"
            header={t("error.occurred")}
            content={t([val.error, "error.undefined"])}
          />

          <Form.Group widths="equal">
            <Form.Input
              label={t("views.meals.add.name_label")}
              placeholder={t("views.meals.add.name_placeholder")}
              value={val.name}
              onChange={(_, { value }) =>
                setVal((v) => {
                  return { ...v, name: value };
                })
              }
              error={
                val.name.trim().length === 0
                  ? t("views.meals.add.name_empty")
                  : false
              }
            />
            <Form.Input
              label={t("views.meals.add.short_label")}
              placeholder={t("views.meals.add.short_placeholder")}
              value={val.short}
              onChange={(_, { value }) =>
                setVal((v) => {
                  return { ...v, short: value };
                })
              }
              error={
                val.short.trim().length === 0
                  ? t("views.meals.add.short_empty")
                  : false
              }
            />
          </Form.Group>
          <Form.Field>
            <label children={t("views.meals.add.components.title")} />
            <Table striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell
                    width={7}
                    content={t("views.meals.add.components.column_component")}
                  />
                  <Table.HeaderCell
                    width={7}
                    content={t("views.meals.add.components.column_variant")}
                  />
                  <Table.HeaderCell width={1} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {Object.entries(val.components).map(([k, v]) => {
                  return renderComponentRow(props.components, k, v, t, setVal);
                })}
              </Table.Body>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell>
                    <Select
                      fluid
                      placeholder={t("views.meals.add.components.component")}
                      disabled={aC.length === 0}
                      options={aC}
                      value={cmp.cmp}
                      onChange={(_, { value }) =>
                        setCmp({ cmp: value, variant: null })
                      }
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <Select
                      fluid
                      placeholder={t("views.meals.add.components.variant")}
                      disabled={cmp.cmp === null}
                      options={
                        cmp.cmp === null
                          ? []
                          : variantOptions(
                              props.components[cmp.cmp].variants,
                              t,
                              true
                            )
                      }
                      value={cmp.variant}
                      onChange={(_, { value }) =>
                        setCmp((c) => {
                          return { ...c, variant: value };
                        })
                      }
                    />
                  </Table.HeaderCell>
                  <Table.HeaderCell textAlign="center">
                    <Button
                      icon="plus"
                      positive
                      disabled={cmp.cmp === null}
                      onClick={() => {
                        if (cmp.cmp !== null) {
                          setVal((v) => {
                            return {
                              ...v,
                              components: {
                                ...v.components,
                                [cmp.cmp]: cmp.variant,
                              },
                            };
                          });
                          setCmp(initCmp);
                        }
                      }}
                    />
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
            </Table>
          </Form.Field>
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button
          icon="trash"
          content={t("button.cancel")}
          labelPosition="left"
          negative
          onClick={() =>
            "onClose" in props
              ? props.onClose()
              : console.warn('no onClose for "new meal" dialog')
          }
        />
        <Button
          icon="plus"
          content={t("views.meals.add.add")}
          labelPosition="left"
          positive
          onClick={() =>
            promisified({
              cmd: "meal",
              sub: {
                cmd: "addMeal",
                name: val.name,
                short: val.short,
                components: val.components,
              },
            })
              .then((r) => handle_unexpected_variant("addedMeal", r.variant, t))
              .then(() =>
                "onAdded" in props
                  ? props.onAdded()
                  : console.warn('no onAdded in "new meal" dialog')
              )
              .then(() =>
                "onClose" in props
                  ? props.onClose()
                  : console.warn('no onClose for "new meal" dialog')
              )
              .catch((e) => handle_error(e, t))
          }
        />
      </Modal.Actions>
    </Modal>
  );
}

function renderComponentRow(components, component, variant, t, setVal) {
  if (!(component in components)) {
    return (
      <Table.Row key={component}>
        <Table.Cell colSpan={3}>Invalid row</Table.Cell>
      </Table.Row>
    );
  }

  return (
    <Table.Row key={component}>
      <Table.Cell content={components[component].name} />
      <Table.Cell>
        <Select
          options={variantOptions(components[component].variants, t)}
          value={variant}
          fluid
          onChange={(_, { value }) => {
            setVal((v) => {
              return {
                ...v,
                components: { ...v.components, [component]: value },
              };
            });
          }}
          placeholder={t("views.meals.add.components.default_variant")}
        />
      </Table.Cell>
      <Table.Cell textAlign="center">
        <Button
          icon="trash"
          compact
          negative
          onClick={() => {
            setVal((v) => {
              let cmp = v.components;
              delete cmp[component];
              return { ...v, components: cmp };
            });
          }}
        />
      </Table.Cell>
    </Table.Row>
  );
}

function variantOptions(variants, t) {
  let vars = [];
  vars.push({
    value: null,
    text: t("views.meals.add.components.default_variant"),
  });

  for (var v in variants) {
    vars.push({ value: v, text: variants[v].name });
  }

  return vars;
}

function availableComponents(components, inUse) {
  let comps = [];
  for (var c in components) {
    if (!(c in inUse)) {
      comps.push({ value: c, text: components[c].name });
    }
  }

  return comps;
}
