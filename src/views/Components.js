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
  Input,
  Table,
} from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../error";

export default function Components() {
  const { t } = useTranslation();
  const [newComponent, setNewComponent] = useState({
    name: "",
    variants: [],
    variantsAvailable: [],
    options: [],
    optionsAvailable: [],
  });
  const [components, setComponents] = useState({ loading: true, data: [] });

  useEffect(() => {
    update(setComponents, t);
  }, [setComponents, t]);

  return (
    <React.Fragment>
      <Header as="h2" attached="top">
        <Icon name="plus" />{" "}
        <Header.Content>{t("views.components.add.title")}</Header.Content>
      </Header>
      <Segment attached="bottom">
        <Form
          onSubmit={(e) => {
            e.preventDefault();

            promisified({
              cmd: "component",
              sub: {
                cmd: "addComponent",
                name: newComponent.name,
                variants: newComponent.variants,
                options: newComponent.options,
              },
            })
              .then(() => {
                setNewComponent((nc) => {
                  return { ...nc, name: "", variants: [], options: [] };
                });
                alert("component added");
              })
              .catch((e) => handle_error(e, t));
          }}
        >
          <Form.Field>
            <label>{t("views.components.add.name_label")}</label>
            <Input
              placeholder={t("views.components.add.name_placeholder")}
              value={newComponent.name}
              onChange={(_, e) => {
                setNewComponent((nc) => {
                  return { ...nc, name: e.value };
                });
              }}
            />
            <Message
              icon="info circle"
              info
              header={t("views.components.add.name_warning_title")}
              content={t("views.components.add.name_warning_content")}
            />
          </Form.Field>

          <Form.Group widths="equal">
            <Form.Field
              label={t("views.components.variants")}
              placeholder={t("views.components.add.variants_placeholder")}
              noResultsMessage={t("views.components.add.variants_none")}
              additionLabel={t("views.components.add.variants_new")}
              control={Select}
              options={newComponent.variantsAvailable}
              value={newComponent.variants}
              onAddItem={(_, { value }) =>
                setNewComponent((nc) => {
                  return {
                    ...nc,
                    variantsAvailable: [
                      { text: value, value },
                      ...nc.variantsAvailable,
                    ],
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
              options={newComponent.optionsAvailable}
              value={newComponent.options}
              onAddItem={(_, { value }) =>
                setNewComponent((nc) => {
                  return {
                    ...nc,
                    optionsAvailable: [
                      { text: value, value },
                      ...nc.optionsAvailable,
                    ],
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
          <Button primary icon labelPosition="left" type="submit">
            <Icon name="send" />
            {t("views.components.add.add")}
          </Button>
        </Form>
      </Segment>

      <Header as="h2" attached="top">
        <Icon name="puzzle piece" />
        <Header.Content>{t("views.components.list.title")}</Header.Content>
      </Header>
      <Segment attached>
        <Button primary disabled icon labelPosition="left">
          <Icon name="plus" />
          {t("views.components.list.add")}
        </Button>
      </Segment>
      <Table striped attached="bottom">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t("views.components.list.column_name")}</Table.HeaderCell>
            <Table.HeaderCell>{t("views.components.list.column_variants")}</Table.HeaderCell>
            <Table.HeaderCell>{t("views.components.list.column_options")}</Table.HeaderCell>
            <Table.HeaderCell>{t("views.components.list.column_actions")}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {components.data.map((e) => {
            return (
              <Table.Row>
                <Table.Cell>{e.name}</Table.Cell>
                <Table.Cell>{e.variants.length}</Table.Cell>
                <Table.Cell>{e.options.length}</Table.Cell>
                <Table.Cell />
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
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
