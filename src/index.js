import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import languageDetector from "i18next-browser-languagedetector";

import de from "./locales/de";
import en from "./locales/en";

i18n
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    // localizations
    resources: {
      de,
      en,
    },

    // language setup
    detection: {
      order: ["navigator"],
    },
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    nonExplicitSupportedLngs: true,

    // other stuff
    interpolation: {
      escapeValue: false,
    },
  });

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
