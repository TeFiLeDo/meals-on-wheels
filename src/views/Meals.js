import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Header, Segment, Table } from "semantic-ui-react";
import New from "../components/meals/New";
import { promisified } from "tauri/api/tauri";
import { handle_unexpected_variant, handle_error } from "../error";

export default function Meals() {
  const { t } = useTranslation();
  const [add, setAdd] = useState(false);
  const [components, setComponents] = useState({});

  useEffect(
    () =>
      promisified({ cmd: "component", sub: { cmd: "getComponents" } })
        .then((r) => {
          console.log(r);
          if (handle_unexpected_variant("gotComponents", r.variant, t)) {
            setComponents(r.data);
          }
        })
        .catch((e) => handle_error(e, t)),
    [setComponents, t]
  );

  return (
    <>
      <Header
        as="h2"
        attached="top"
        icon="food"
        content={t("views.meals.list.title")}
      />
      <Segment attached>
        <Button
          primary
          icon="plus"
          content={t("views.meals.list.add")}
          labelPosition="left"
          onClick={() => setAdd(true)}
        />
      </Segment>
      <Table striped attached="bottom">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content={t("views.meals.list.column_name")} />
            <Table.HeaderCell content={t("views.meals.list.column_short")} />
            <Table.HeaderCell content={t("views.meals.list.column_actions")} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell
              colSpan={3}
              content={t("views.meals.list.empty")}
              textAlign="center"
            />
          </Table.Row>
        </Table.Body>
      </Table>

      <New open={add} onClose={() => setAdd(false)} components={components} />
    </>
  );
}
