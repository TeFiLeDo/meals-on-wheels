import React from "react";
import { promisified } from "tauri/api/tauri";

import "semantic-ui-css/semantic.min.css";
import { Button } from "semantic-ui-react";

import SelectDataset from "./components/SelectDataset";
import { withTranslation } from "react-i18next";
import { handle_error, handle_unexpected_variant } from "./error";

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
        }
      })
      .catch((e) => handle_error(e, t));
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
        <React.Fragment>
          <p>
            {this.state.month}. {this.state.year}
          </p>
          <Button
            icon="save"
            onClick={() =>
              promisified({ cmd: "global", sub: { cmd: "save" } })
                .then((r) => {
                  if (
                    handle_unexpected_variant("saved", r.variant, this.props.t)
                  ) {
                    console.log("saved");
                  }
                })
                .catch((e) => handle_error(e, this.props.t))
            }
          ></Button>
        </React.Fragment>
      );
    }

    return <React.Fragment></React.Fragment>;
  }
}

export default withTranslation()(App);
