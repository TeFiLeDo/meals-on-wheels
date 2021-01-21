import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu, Confirm } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../error";

export default function SiteHeader(props) {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <React.Fragment>
      <Menu fixed="top" inverted color="blue">
        <Menu.Item header as={Link} title={t("app.title")}>
          {t(["app.short", "app.title"])}
        </Menu.Item>

        <Menu.Menu position="right">
          <Menu.Item
            icon="save"
            onClick={() =>
              promisified({ cmd: "global", sub: { cmd: "save" } })
                .then((r) => {
                  if (handle_unexpected_variant("saved", r.variant, t)) {
                    console.log("saved");
                  }
                })
                .catch((e) => handle_error(e, t))
            }
          />
          <Menu.Item icon="log out" onClick={() => setShowConfirm(true)} />
          <Confirm
            header={t("select_dataset.close_confirm_header")}
            content={t("select_dataset.close_confirm_body")}
            open={showConfirm}
            onConfirm={() => {
              setShowConfirm(false);
              props.closeDataset();
            }}
            onCancel={() => setShowConfirm(false)}
          />
        </Menu.Menu>
      </Menu>
    </React.Fragment>
  );
}
