import React from "react";
import { promisified } from "tauri/api/tauri";

import "semantic-ui-css/semantic.min.css";

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
    alert(`Not yet implemented.\n\nYear:\t${year}\nMonth:\t${month}`);
  }

  update() {
    promisified({ cmd: "global", sub: { cmd: "getState" } })
      .then((r) => {
        console.log(r);
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
    console.log(this.state);
    if (this.state.state === "select") {
      return (
        <SelectDataset
          selectDataset={this.selectDataset.bind(this)}
          createDataset={this.createDataset.bind(this)}
        />
      );
    } else if (this.state.state === "loaded") {
      return (
        <p>
          {this.state.month}. {this.state.year}
        </p>
      );
    }

    return <React.Fragment></React.Fragment>;
  }
}
