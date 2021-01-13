import React from "react";
import { promisified } from "tauri/api/tauri";

import "semantic-ui-css/semantic.min.css";

import SelectDataset from "./components/SelectDataset";

export default class App extends React.Component {
  state = {
    state: "loading",
  };

  selectDataset(year, month) {
    alert(`Not yet implemented.\n\nYear:\t${year}\nMonth:\t${month}`);
  }

  componentDidMount() {
    promisified({ cmd: "global", sub: { cmd: "getState" } })
      .then((r) => {
        if (r.variant !== "gotState") {
          throw new Error(
            `expected return variant 'gotState', got ${r.variant}`
          );
        } else {
          this.setState({ state: r.state });
        }
      })
      .catch((e) => console.log(e));
  }

  render() {
    if (this.state.state === "select") {
      return (
        <SelectDataset
          selectDataset={this.selectDataset.bind(this)}
        ></SelectDataset>
      );
    }

    return <React.Fragment></React.Fragment>;
  }
}
