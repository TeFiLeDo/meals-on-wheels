import React from "react";

import {
  Form,
  Grid,
  Header,
  Select,
  Message,
  Icon,
  Segment,
  Button,
} from "semantic-ui-react";
import { promisified } from "tauri/api/tauri";
import { withTranslation } from "react-i18next";
import { handle_error, handle_unexpected_variant } from "../error";

class SelectDataset extends React.Component {
  state = {
    loading: true,
    data: null,
    currentYear: null,
    currentMonth: null,
    canCreateNow: false,
    canCreateNext: false,
  };

  componentDidMount() {
    promisified({ cmd: "global", sub: { cmd: "getAvailableDatasets" } })
      .then((d) => {
        if (handle_unexpected_variant("gotDatasets", d.variant, this.props.t)) {
          this.setState({
            loading: false,
            data: d.data,
            currentYear: d.currentYear,
            currentMonth: d.currentMonth,
            canCreateNow: d.canCreateNow,
            canCreateNext: d.canCreateNext,
          });
        }
      })
      .catch((e) => handle_error(e, this.props.t));
  }

  years() {
    let years = [];

    for (let y in this.state.data) {
      let yi = Number(y);
      years.push({
        key: yi,
        value: yi,
        text: y,
      });
    }

    return years;
  }

  monthDisabled(month) {
    if (month === null) {
      return true;
    } else if (this.state.data === null) {
      return true;
    } else if (this.state.currentYear === null) {
      return true;
    } else {
      let year = this.state.data[this.state.currentYear];
      if (year === null) {
        return true;
      } else {
        return !year.includes(month);
      }
    }
  }

  months() {
    let t = this.props.t;

    return [
      {
        key: 1,
        value: 1,
        disabled: this.monthDisabled(1),
        text: t("month.january"),
      },
      {
        key: 2,
        value: 2,
        disabled: this.monthDisabled(2),
        text: t("month.february"),
      },
      {
        key: 3,
        value: 3,
        disabled: this.monthDisabled(3),
        text: t("month.march"),
      },
      {
        key: 4,
        value: 4,
        disabled: this.monthDisabled(4),
        text: t("month.april"),
      },
      {
        key: 5,
        value: 5,
        disabled: this.monthDisabled(5),
        text: t("month.may"),
      },
      {
        key: 6,
        value: 6,
        disabled: this.monthDisabled(6),
        text: t("month.june"),
      },
      {
        key: 7,
        value: 7,
        disabled: this.monthDisabled(7),
        text: t("month.july"),
      },
      {
        key: 8,
        value: 8,
        disabled: this.monthDisabled(8),
        text: t("month.august"),
      },
      {
        key: 9,
        value: 9,
        disabled: this.monthDisabled(9),
        text: t("month.september"),
      },
      {
        key: 10,
        value: 10,
        disabled: this.monthDisabled(10),
        text: t("month.october"),
      },
      {
        key: 11,
        value: 11,
        disabled: this.monthDisabled(11),
        text: t("month.november"),
      },
      {
        key: 12,
        value: 12,
        disabled: this.monthDisabled(12),
        text: t("month.december"),
      },
    ];
  }

  render() {
    let t = this.props.t;

    return (
      <Grid
        textAlign="center"
        style={{ height: "100vh" }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 600 }}>
          <Header as="h1" textAlign="center">
            {t("views.select_dataset.title")}
          </Header>
          <Segment>
            {this.renderLoadingMessage()}
            {this.renderEmptyMessage()}

            <Form style={{ textAlign: "left" }}>
              <Form.Field
                label={t("views.select_dataset.year_label")}
                control={Select}
                options={this.years()}
                placeholder={t("views.select_dataset.year_placeholder")}
                value={this.state.currentYear}
                onChange={(e, d) => this.setState({ currentYear: d.value })}
                disabled={
                  this.state.loading ||
                  Object.keys(this.state.data).length === 0
                }
              />
              <Form.Field
                label={t("views.select_dataset.month_label")}
                control={Select}
                options={this.months()}
                placeholder={t("views.select_dataset.month_placeholder")}
                value={this.state.currentMonth}
                onChange={(e, d) => this.setState({ currentMonth: d.value })}
                disabled={this.state.loading || this.state.currentYear === null}
                error={
                  this.monthDisabled(this.state.currentMonth) &&
                  this.state.currentMonth !== null
                    ? t("views.select_dataset.month_not_available")
                    : null
                }
              />
              <Form.Field>
                <Button
                  positive
                  icon
                  labelPosition="left"
                  fluid
                  disabled={
                    this.state.currentYear === null ||
                    this.monthDisabled(this.state.currentMonth)
                  }
                  onClick={() =>
                    this.props.selectDataset(
                      this.state.currentYear,
                      this.state.currentMonth
                    )
                  }
                >
                  <Icon name="folder open" />
                  {t("views.select_dataset.load")}
                </Button>
              </Form.Field>
              <Form.Field>
                <Button.Group fluid>
                  <Button
                    icon
                    labelPosition="left"
                    disabled={!this.state.canCreateNext}
                    onClick={() => this.props.createDataset(true)}
                  >
                    <Icon name="calendar" />
                    {t("views.select_dataset.new_next")}
                  </Button>
                  <Button
                    primary
                    icon
                    labelPosition="left"
                    disabled={!this.state.canCreateNow}
                    onClick={() => this.props.createDataset(false)}
                  >
                    <Icon name="plus" />
                    {t("views.select_dataset.new_now")}
                  </Button>
                </Button.Group>
              </Form.Field>
            </Form>
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }

  renderLoadingMessage() {
    if (this.state.loading === true) {
      let t = this.props.t;

      return (
        <Message icon style={{ textAlign: "left" }}>
          <Icon name="circle notched" loading />
          <Message.Content>
            <Message.Header>{t("views.select_dataset.loading_title")}</Message.Header>
            {t("views.select_dataset.loading_message")}
          </Message.Content>
        </Message>
      );
    }
  }

  renderEmptyMessage() {
    if (
      this.state.loading === false &&
      Object.keys(this.state.data).length === 0
    ) {
      let t = this.props.t;

      return (
        <Message
          icon="warning sign"
          warning
          header={t("views.select_dataset.empty_title")}
          content={t("views.select_dataset.empty_message")}
          style={{ textAlign: "left" }}
        />
      );
    }
  }
}

export default withTranslation()(SelectDataset);
