import React from "react";
import { promisified } from "tauri/api/tauri";
import { setTitle } from "tauri/api/window";

import "semantic-ui-css/semantic.min.css";
import { Container } from "semantic-ui-react";

import SelectDataset from "./views/SelectDataset";
import { withTranslation } from "react-i18next";
import { handle_error, handle_unexpected_variant } from "./error";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SiteHeader from "./components/SiteHeader";
import Components from "./views/Components";
import Meals from "./views/Meals";

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
            alert(t("views.select_dataset.mismatch"));
          }
          if (r.isBackup) {
            alert(t("views.select_dataset.loaded_backup"));
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
    setTitle(this.props.t("app.title"));

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
          <div style={{ height: "5rem" }} />
          <Container>
            <Switch>
              <Route path="/" exact>
                Default route
              </Route>
              <Route path="/components">
                <Components />
              </Route>
              <Route path="/meals">
                <Meals />
              </Route>
            </Switch>
          </Container>
        </Router>
      );
    } else {
      return <p>Invalid state</p>;
    }
  }
}

export default withTranslation()(App);
