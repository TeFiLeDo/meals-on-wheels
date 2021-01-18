import React from "react";
import { promisified } from "tauri/api/tauri";

import "semantic-ui-css/semantic.min.css";
import { Button } from "semantic-ui-react";

import SelectDataset from "./components/SelectDataset";

export default class App extends React.Component {
  state = {
    state: "loading",
    year: null,
    month: null,
  };

  createDataset(nextMonth) {
    promisified({
      cmd: "global",
      sub: { cmd: "newDataset", nextMonth: nextMonth },
    }).then((r) => {
      if (r.variant !== "createdDataset") {
        throw new Error(
          `expected return variant 'createdDataset', got ${r.variant}`
        );
      } else {
        this.update();
      }
    });
  }

  selectDataset(year, month) {
    promisified({
      cmd: "global",
      sub: { cmd: "openDataset", year: year, month: month },
    }).then((r) => {
      if (r.variant !== "openedDataset") {
        throw new Error(
          `expected return variant 'openedDataset', got ${r.variant}`
        );
      } else {
        this.update();

        if (r.mismatch) {
          alert(
            "The date specified within the dataset differs from its file name!"
          );
        }
      }
    });
  }

  update() {
    promisified({ cmd: "global", sub: { cmd: "getState" } })
      .then((r) => {
        if (r.variant !== "gotState") {
          throw new Error(
            `expected return variant 'gotState', got ${r.variant}`
          );
        } else {
          this.setState({
            state: r.state.state,
            year: r.state.year,
            month: r.state.month,
          });
        }
      })
      .catch((e) => console.log(e));
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
                  if (r.variant !== "saved") {
                    throw new Error(
                      `expected return variant 'saved', got ${r.variant}`
                    );
                  } else {
                    console.log("saved");
                  }
                })
                .catch((e) => console.log(e))
            }
          ></Button>
        </React.Fragment>
      );
    }

    return <React.Fragment></React.Fragment>;
  }
}
