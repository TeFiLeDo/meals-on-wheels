import React from 'react';

import { Form, Grid, Header, Select, Message, Icon, Segment, Button } from 'semantic-ui-react';
import { promisified } from 'tauri/api/tauri';

export default class SelectMonth extends React.Component {
    state = {
        loading: true,
        data: null,
        currentYear: null,
        currentMonth: null,
    }

    componentDidMount() {
        promisified({ cmd: 'gGetAvailableMonths' })
            .then((d) => {
                console.log(d);
                d.loading = false;
                this.setState(d);
            })
            .catch((e) => console.log(e));
    }

    years() {
        let years = [];

        for (let y in this.state.data) {
            let yi = Number(y);
            years.push({
                key: yi,
                value: yi,
                text: y
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
        return [
            { key: 1, value: 1, disabled: this.monthDisabled(1), text: 'January' },
            { key: 2, value: 2, disabled: this.monthDisabled(2), text: 'February' },
            { key: 3, value: 3, disabled: this.monthDisabled(3), text: 'March' },
            { key: 4, value: 4, disabled: this.monthDisabled(4), text: 'April' },
            { key: 5, value: 5, disabled: this.monthDisabled(5), text: 'May' },
            { key: 6, value: 6, disabled: this.monthDisabled(6), text: 'June' },
            { key: 7, value: 7, disabled: this.monthDisabled(7), text: 'July' },
            { key: 8, value: 8, disabled: this.monthDisabled(8), text: 'August' },
            { key: 9, value: 9, disabled: this.monthDisabled(9), text: 'September' },
            { key: 10, value: 10, disabled: this.monthDisabled(10), text: 'October' },
            { key: 11, value: 11, disabled: this.monthDisabled(11), text: 'November' },
            { key: 12, value: 12, disabled: this.monthDisabled(12), text: 'December' },];
    }

    render() {
        return (
            <Grid
                textAlign='center'
                style={{ height: '100vh' }}
                verticalAlign='middle'
            >
                <Grid.Column style={{ maxWidth: 600 }}>
                    <Header as='h1' textAlign='center'>
                        Choose a month
                    </Header>

                    <Segment>
                        <Message icon style={{ textAlign: 'left' }} hidden={!this.state.loading}>
                            <Icon name='circle notched' loading />
                            <Message.Content>
                                <Message.Header>Just a second</Message.Header>
                            We are just checking what datasets are available.
                        </Message.Content>
                        </Message>
                        <Message
                            icon='warning sign'
                            warning
                            header='No datasets found'
                            content='Maybe you want to create a new dataset?'
                            hidden={this.state.loading || Object.keys(this.state.data).length > 0}
                            style={{ textAlign: 'left' }}
                        />

                        <Form style={{ textAlign: 'left' }}>
                            <Form.Field
                                label='Year'
                                control={Select}
                                options={this.years()}
                                placeholder='Select a year'
                                value={this.state.currentYear}
                                onChange={(e, d) => this.setState({ currentYear: d.value })}
                            />
                            <Form.Field
                                label='Month'
                                control={Select}
                                options={this.months()}
                                placeholder='Select a month'
                                value={this.state.currentMonth}
                                onChange={(e, d) => this.setState({ currentMonth: d.value })}
                                error={
                                    this.monthDisabled(this.state.currentMonth) && this.state.currentMonth !== null
                                        ? 'This month is not available for the selected year.'
                                        : null
                                }
                            />
                            <Button.Group fluid>
                                <Button icon labelPosition='left' disabled>
                                    <Icon name='file' />
                                    New File
                                </Button>
                                <Button positive icon labelPosition='left'
                                    disabled={this.state.currentYear === null || this.monthDisabled(this.state.currentMonth)}
                                    onClick={() => this.props.selectMonth(this.state.currentYear, this.state.currentMonth)}
                                >
                                    <Icon name='folder' />
                                    Open File
                                </Button>
                            </Button.Group>
                        </Form>
                    </Segment>
                </Grid.Column>
            </Grid>
        );
    }
}
