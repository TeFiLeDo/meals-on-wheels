import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../error";

export default function SiteHeader() {
  const { t } = useTranslation();

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
        </Menu.Menu>
      </Menu>
    </React.Fragment>
  );
}
