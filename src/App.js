import React from "react";
import { promisified } from "tauri/api/tauri";

import "semantic-ui-css/semantic.min.css";

import SelectDataset from "./components/SelectDataset";
import { withTranslation } from "react-i18next";
import { handle_error, handle_unexpected_variant } from "./error";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SiteHeader from "./components/SiteHeader";

class App extends React.Component {
  state = {
    state: "loading",
    year: null,
    month: null,
  };

  createDataset(nextMonth) {
    promisified({
      cmd: "global",
      sub: { cmd: "newDataset", nextMonth: nextMonth },
    })
      .then((r) => {
        if (
          handle_unexpected_variant("createdDataset", r.variant, this.props.t)
        ) {
          this.update();
        }
      })
      .catch((e) => handle_error(e, this.props.t));
  }

  selectDataset(year, month) {
    let t = this.props.t;

    promisified({
      cmd: "global",
      sub: { cmd: "openDataset", year: year, month: month },
    })
      .then((r) => {
        if (handle_unexpected_variant("openedDataset", r.variant, t)) {
          this.update();

          if (r.mismatch) {
            alert(t("select_dataset.mismatch"));
          }
          if (r.isBackup) {
            alert(t("available_tmp_dataset"));
          }
        }
      })
      .catch((e) => handle_error(e, t));
  }

  closeDataset() {
    promisified({ cmd: "global", sub: { cmd: "closeDataset" } })
      .then((r) => {
        if (
          handle_unexpected_variant("closedDataset", r.variant, this.props.t)
        ) {
          this.update();
        }
      })
      .catch((e) => handle_error(e, this.props.t));
  }

  update() {
    let t = this.props.t;

    promisified({ cmd: "global", sub: { cmd: "getState" } })
      .then((r) => {
        if (handle_unexpected_variant("gotState", r.variant, t)) {
          this.setState({
            state: r.state.state,
            year: r.state.year,
            month: r.state.month,
          });
        }
      })
      .catch((e) => handle_error(e, t));
  }

  componentDidMount() {
    this.update();
  }

  render() {
    if (this.state.state === "select") {
      return (
        <SelectDataset
          selectDataset={this.selectDataset.bind(this)}
          createDataset={this.createDataset.bind(this)}
        />
      );
    } else if (this.state.state === "loaded") {
      return (
        <Router>
          <SiteHeader closeDataset={this.closeDataset.bind(this)} />
          <Switch>
            <Route path="/" exact>
              Default route
            </Route>
          </Switch>
        </Router>
      );
    } else {
      return <p>Invalid state</p>;
    }
  }
}

export default withTranslation()(App);
