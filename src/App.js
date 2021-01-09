import React from 'react';
import { promisified } from "tauri/api/tauri";

import 'semantic-ui-css/semantic.min.css';

import SelectDataset from './components/SelectDataset';

export default class App extends React.Component {
  state = {
    state: 'loading',
  }

  selectMonth(year, month) {
    alert(`Not yet implemented.\n\nYear:\t${year}\nMonth:\t${month}`);
  }

  componentDidMount() {
    promisified({ cmd: 'gGetState' })
      .then((d) => this.setState(d))
      .catch((e) => console.log(e));
  }

  render() {
    if (this.state.state === 'select') {
      return (
        <SelectDataset selectMonth={this.selectMonth.bind(this)}></SelectDataset>
      );
    }

    return (
      <React.Fragment></React.Fragment>
    );
  }
}
