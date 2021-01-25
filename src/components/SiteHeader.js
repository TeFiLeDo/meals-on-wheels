import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Menu, Confirm, Dropdown, Icon } from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { handle_error, handle_unexpected_variant } from "../error";

export default function SiteHeader(props) {
  const { t, i18n } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(null);

  let save_icon,
    save_loading = false;
  if (saving === "saved") {
    save_icon = "check";
  } else if (saving === "saving") {
    save_icon = "spinner";
    save_loading = true;
  } else {
    save_icon = "save";
  }

  return (
    <React.Fragment>
      <Menu fixed="top" inverted color="blue">
        <Menu.Item header as={Link} to="/" title={t("app.title")}>
          {t(["app.short", "app.title"])}
        </Menu.Item>
        <Menu.Item
          as={Link}
          to="/components"
          content={t("header.nav.components")}
        />

        <Menu.Menu position="right">
          <Menu.Item title={t("header.action_choose_language")}>
            <Dropdown
              compact
              options={[
                { key: "de", value: "de", text: "🇦🇹", title: "Deutsch" },
                { key: "en", value: "en", text: "🇬🇧", title: "English" },
              ]}
              value={i18n.language.substring(0, 2)}
              onChange={(_, { value }) => i18n.changeLanguage(value)}
            />
          </Menu.Item>
          <Menu.Item
            icon
            title={t("header.action_save")}
            onClick={() => {
              setSaving("saving");
              promisified({ cmd: "global", sub: { cmd: "save" } })
                .then((r) => {
                  handle_unexpected_variant("saved", r.variant, t);
                  setSaving("saved");
                  setTimeout(() => setSaving(null), 2500);
                })
                .catch((e) => {
                  setSaving(null);
                  handle_error(e, t);
                });
            }}
          >
            <Icon name={save_icon} loading={save_loading} />
          </Menu.Item>
          <Menu.Item
            icon="log out"
            title={t("header.action_close")}
            onClick={() => setShowConfirm(true)}
          />
          <Confirm
            header={t("header.action_close_confirm_header")}
            content={t("header.action_close_confirm_body")}
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
