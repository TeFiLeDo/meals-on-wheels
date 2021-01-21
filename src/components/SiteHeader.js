import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu, Confirm, Dropdown } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../error";

export default function SiteHeader(props) {
  const { t, i18n } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  console.log(i18n.language);

  return (
    <React.Fragment>
      <Menu fixed="top" inverted color="blue">
        <Menu.Item header as={Link} title={t("app.title")}>
          {t(["app.short", "app.title"])}
        </Menu.Item>

        <Menu.Menu position="right">
          <Menu.Item title={t("app.choose_language")}>
            <Dropdown
              compact
              options={[
                { key: "en", value: "en", text: "🇬🇧" },
                { key: "de", value: "de", text: "🇦🇹" },
              ]}
              value={i18n.language.substring(0, 2)}
              onChange={(_, { value }) => i18n.changeLanguage(value)}
            />
          </Menu.Item>
          <Menu.Item
            icon="save"
            title={t("select_dataset.save")}
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
          <Menu.Item
            icon="log out"
            title={t("select_dataset.close")}
            onClick={() => setShowConfirm(true)}
          />
          <Confirm
            header={t("select_dataset.close_confirm_header")}
            content={t("select_dataset.close_confirm_body")}
            confirmButton={t("button.ok")}
            cancelButton={t("button.cancel")}
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
