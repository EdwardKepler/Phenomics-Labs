import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart, Resizable } from "react-timeseries-charts";
import { TimeSeries, TimeRange, Event } from "pondjs";
import _ from 'underscore';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import RaisedButton from 'material-ui/RaisedButton';
import PowerIcon from 'material-ui/svg-icons/action/power-settings-new';
import ScheduleIcon from 'material-ui/svg-icons/action/schedule';
import EmptyIcon from 'material-ui/svg-icons/action/opacity';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import CameraIcon from 'material-ui/svg-icons/image/camera-alt';
import EnergyIcon from 'material-ui/svg-icons/image/flash-on';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import ImageOne from '../app/components/images/ImageOne';
import CameraComponent from './CameraComponent';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import { Row, Col } from 'react-flexbox-grid';
import CircularProgress from 'material-ui/CircularProgress';
import Gauge from 'react-svg-gauge';


// TODO: extend base thing
class GrowMobile extends Component {
  constructor(props) {
    super(props);
  }

  handleTap = (event) => {
    let device = event.currentTarget.dataset.device;
    let command = this.props.thing.properties[`${device}_state`] === 'on' ? `turn_${device}_off` : `turn_${device}_on`;
    this.sendCommand(command);
  };

  handleOpen = (event) => {
    this.setState({settingsDialogOpen: true});
  };

  handleClose = (event) => {
    this.setState({settingsDialogOpen: false});
  };

  handleValueChange = (event, newValue) => {
    const key = event.target.dataset.key;
    this.setProperty(key, newValue);
  };

  handleScheduleChange = (event, newValue) => {
    this.sendCommand('stop');
    let key = event.target.dataset.key;
    this.setProperty(key, newValue);
    this.sendCommand('start');
  }

  state = {
    settingsDialogOpen: false,
    types: [
      {
        type: 'temp',
        title: 'Room Temparature',
        icon: 'wi wi-thermometer',
        unit: 'wi wi-celsius',
        max: 40
      },
      {
        type: 'humidity',
        title: 'Room Humidity',
        icon: 'wi wi-humidity'
      },
      {
        type: 'lux',
        title: 'Light (lux)',
        icon: 'wi wi-sunny'
      },
      {
        type: 'ph',
        title: 'pH',
        icon: 'wi wi-raindrop',
        max: 14,
      },
      {
        type: 'ec',
        title: 'Conductivity (ec)',
        icon: 'wi wi-barometer',
        max: 2000,
      },
      {
        type: 'water_temperature',
        title: 'Temperature',
        icon: 'wi wi-thermometer',
        unit: 'wi wi-celsius'
      }
    ]
  };

  getEvents(type) {
    const e = this.props[`${type}Events`];

    let data = {
      name: type,
      columns: ["time", "value"],
      points: []
    };
    _.each(e, (value, key, list) => {
      data.points.unshift([value.event.timestamp.getTime(), value.event.message])
    });
    if (data.points[0]) return new TimeSeries(data);
  }

  sendCommand (method, options) {
    Meteor.call('Thing.sendCommand',
      this.props.thing.uuid,
      method,
      options,
      (error, documentId) => {
        if (error) {
          console.error("Error", error);
          return alert(`Error: ${error.reason || error}`);
        }
      }
    );
  }

  setProperty = (key, value) => {
    let command = 'setProperty';
    let options = {
      key: key,
      value: value
    };
    this.sendCommand(command, options);
  }

  takePicture = () => {
    this.sendCommand('picture');
  }

  updateGrowfile = () => {
    try {
      let growfile = JSON.parse(document.getElementById('Growfile').value);
      this.setProperty('growfile', growfile);
      this.sendCommand('restart');
    } catch (err) {
      alert(err);
    }
  }

  getEventValue(type) {
    const e = this.props[`${type}Events`];
    if (e) {
      return e[0] ? Number(e[0].event.message).toFixed(2) : 'NA';
    }
  }

  getEvents(type) {
    const e = this.props[`${type}Events`];

    let data = {
      name: type,
      columns: ["time", "value"],
      points: []
    };
    _.each(e, (value, key, list) => {
      data.points.unshift([value.event.timestamp.getTime(), value.event.message])
    });
    if (data.points[0]) return new TimeSeries(data);
  }

  renderCamera() {
    const styles = {
      button: {
        position: 'relative',
        bottom: 50
      },
      img: {
        maxHeight: '100%',
        minHeight: 300,
        width: '100%',
        // maxWidth: 600
      },
      white: {
        color: 'white'
      }
    }

    if (this.props.ready && this.props.image) {
      'use strict';

      let image = this.props.image;
      let link = Images.findOne({_id: image._id}).link();

      return (
        <div style={styles.main}>
            <img src={link} style={styles.img} />
            <IconButton onTouchTap={this.takePicture}
                        tooltip="Take picture"
                        style={styles.button}
                        iconStyle={styles.white} ><CameraIcon /></IconButton>
        </div>
      )

    } else return (
      <div style={styles.img}>No Images
        <IconButton onTouchTap={this.takePicture}
                    tooltip="Take picture">
          <CameraIcon />
        </IconButton>
      </div>
    )
  }

  render() {
    const styles = {
      actionButton: {
        marginRight: 20,
        marginleft: 20
      },
      actuator: {
        padding: 10,
        float: 'left',
        marginRight: 20
      },
      energyIcon: {
        height: 14,
        width: 14,
        position: 'relative',
        left: 2
      },
      main: {
        margin: '20px',
        // maxWidth: 550,
      },
      oneHundred: {
        width: '100%'
      },
      options: {
        marginLeft: 200,
        position: 'relative',
        bottom: 100,
      },
      powerData: {
        position: 'relative',
        fontSize: 10,
        padding: 10,
        top: 9,
      },
      powerStats: {
        marginLeft: -22,
        fontSize: 13
      },
      right: {
        float: 'right'
      },
      sensorData: {
        textAlign: 'center',
      },
      sensorIcon: {
        marginRight: 5
      },
      settings: {
        float: 'right'
      },
      smallFont: {
        fontSize: 11
      },
      smallIcon: {
        height: 15,
        width: 15,
        padding: 0,
        marginLeft: 3,
      },
      values: {
        fontSize: 25
      },
    }

    const thing = this.props.thing;
    const properties = this.props.thing.properties;
    const alerts = this.props.thing.properties.alerts || {};
    const width = 400;

    return (
      <Card style={styles.main}>
      <CardMedia>
        <img src="/img/pic1.jpg"
             style={{
              maxWidth:100
             }}/>
      </CardMedia>
        <CardText>
              <div>
                  <img src="/img/growmobile.png"
                       style={{
                        maxWidth:100
                       }}/>
                  <IconButton
                    tooltip="Options"
                    tooltipPosition="top-center"
                    onTouchTap={this.handleOpen}>
                    <SettingsIcon />
                  </IconButton>
              </div>
              <Row style={styles.sensorData}>
                {
                  this.state.types.map((v, k) => {
                    const events = this.getEvents(v.type);
                    return <Col xs={4} md={4} key={k}>
                      <div style={styles.sensorData}>
                        <h4>
                          <i className={v.icon} style={styles.sensorIcon}></i>
                          {v.title}
                          {v.unit ? <i className={v.unit} style={styles.sensorIcon}></i>: null}
                          {v.comment ? <span style={styles.sensorIcon}>{v.comment}</span>: null}
                          {
                            alerts[v.type] ? <span style={styles.smallFont}><IconButton
                              iconStyle={styles.smallIcon}
                              style={styles.smallIcon}>
                              <WarningIcon />
                            </IconButton> {alerts[v.type]}</span>: <span></span>
                          }
                        </h4>
                      </div>
                      <Gauge value={this.getEventValue(v.type)}
                             width={200}
                             height={150}
                             max={v.max}
                             label={null}
                             valueLabelStyle={styles.values}
                             color={alerts[v.type] ? 'red': 'green'} />
                    </Col>
                  })
                }
                {
                  // // Todo: Old line chart code.
                  // this.state.types.map((v, k) => {
                  //   const events = this.getEvents(v.type);
                  //   return <div key={k}>
                  //     <div style={styles.sensorData}>
                  //     <i className={v.icon} 
                  //       style={styles.sensorIcon}></i> {v.title}: <strong>{this.getEventValue(v.type)}</strong>
                  //     {v.unit ? <i className={v.unit} style={styles.sensorIcon}></i>: null}
                  //     {v.comment ? <span style={styles.sensorIcon}>{v.comment}</span>: null}
                  //     {
                  //       alerts[v.type] ? <IconButton
                  //         tooltip={alerts[v.type]}
                  //         tooltipPosition="top-center"
                  //         iconStyle={styles.smallIcon}
                  //         style={styles.smallIcon}>
                  //         <WarningIcon />
                  //       </IconButton>: <span></span>
                  //     }
                  //     </div>
                  //     {
                  //     !events ? <div><CircularProgress /> Loading</div> :
                  //       <ChartContainer timeRange={events.range()} width={width}>
                  //         <ChartRow height="150">
                  //           <YAxis
                  //             id={v.type}
                  //             min={events.min()} max={events.max()}
                  //             width="30" />
                  //           <Charts>
                  //             <LineChart axis={v.type} series={events} />
                  //           </Charts>
                  //         </ChartRow>
                  //       </ChartContainer>
                  //     }
                  //   </div>
                  // })
                }
          </Row>
          <Divider />
          <Row>
            <Col xs={3} md={3}>
              <div style={styles.actuator}>
                <div style={styles.actionButton}>
                  <h3>AC</h3>
                  <FloatingActionButton secondary={this.props.thing.properties.light_state === 'on' ? true: false}
                    backgroundColor="rgb(208, 208, 208)"
                    data-device="light"
                    onTouchTap={this.handleTap}>
                    <PowerIcon />
                  </FloatingActionButton>
                  <br/>
                {
                  // <TextField
                  //   hintText="Day start"
                  //   floatingLabelText="Day start"
                  //   data-key="interval"
                  //   defaultValue={thing.properties.growfile.night.schedule}
                  //   onChange={this.handleScheduleChange}
                  // />
                  // <br/>
                  // <TextField
                  //   hintText="Night start"
                  //   floatingLabelText="Night start"
                  //   data-key="interval"
                  //   defaultValue={thing.properties.growfile.night.schedule}
                  //   onChange={this.handleScheduleChange}
                  // />
                }
                </div>
              </div>
            </Col>
            <Col xs={3} md={3}>
              <div style={styles.actuator}>
                <div style={styles.actionButton}>
                  <h3>Heater</h3>
                  <FloatingActionButton secondary={this.props.thing.properties.pump_state === 'on' ? true: false}
                    backgroundColor="rgb(208, 208, 208)"
                    data-device="pump"
                    onTouchTap={this.handleTap}>
                    <PowerIcon />
                  </FloatingActionButton>
                </div>
              </div>
            </Col>
            <Col xs={3} md={3}>
              <div style={styles.actuator}>
                <div style={styles.actionButton}>
                  <h3>Humidifier</h3>
                  <FloatingActionButton secondary={this.props.thing.properties.pump_state === 'on' ? true: false}
                    backgroundColor="rgb(208, 208, 208)"
                    data-device="pump"
                    onTouchTap={this.handleTap}>
                    <PowerIcon />
                  </FloatingActionButton>
                </div>
              </div>
            </Col>
            <Col xs={3} md={3}>
              <div style={styles.actuator}>
                <div style={styles.actionButton}>
                  <h3>Dehumidifier</h3>
                  <FloatingActionButton secondary={this.props.thing.properties.pump_state === 'on' ? true: false}
                    backgroundColor="rgb(208, 208, 208)"
                    data-device="pump"
                    onTouchTap={this.handleTap}>
                    <PowerIcon />
                  </FloatingActionButton>
                </div>
              </div>
            </Col>
          </Row>
          <Dialog
            title="Settings"
            actions={<FlatButton
              label="Close"
              primary={true}
              onTouchTap={this.handleClose}
            />}
            modal={false}
            autoScrollBodyContent={true}
            onRequestClose={this.handleClose}
            open={this.state.settingsDialogOpen}>
            <TextField
              hintText="Log data every (milliseconds)"
              floatingLabelText="Log data every (milliseconds)"
              data-key="interval"
              defaultValue={thing.properties.interval}
              onChange={this.handleScheduleChange}
            />
            <br/>

            <TextField
              hintText="Insert valid Growfile JSON"
              errorText="This field is required."
              floatingLabelText="Growfile"
              id="Growfile"
              ref="Growfile"
              defaultValue={JSON.stringify(thing.properties.growfile, null, 2)}
              multiLine={true}
              style={styles.oneHundred}
              rows={10}
            />
            <br/>
            <RaisedButton label="Update Growfile" primary={true} onTouchTap={this.updateGrowfile}/>
            <br/>
            <br/>
            <br/>
            <Divider />
            <p>Auth credentials:</p>
            <p>uuid: {thing.uuid}</p>
            <p>token: {thing.token}</p>
            <RaisedButton label="Delete Grow Hub" secondary={true} />
          </Dialog>
          <br/>
        </CardText>
        <CardActions>
          {this.props.actions}
        </CardActions>
      </Card>
    )
  }
}

GrowMobile.propTypes = {
  ecEvents: PropTypes.array,
  phEvents: PropTypes.array,
  image: PropTypes.object,
  tempEvents: PropTypes.array,
  water_temperatureEvents: PropTypes.array,
  humidityEvents: PropTypes.array,
  luxEvent: PropTypes.object,
  ready: PropTypes.bool,
  alerts: PropTypes.array,
  events: PropTypes.array,
}

export default GrowMobileContainer = createContainer(({ thing }) => {
  const eventsHandle = Meteor.subscribe('Thing.events', thing.uuid);
  const imagesHandle = Meteor.subscribe('Thing.images', thing.uuid, 1);

  const ready = [ eventsHandle, imagesHandle ].every(
    (h) => {
      return h.ready();
    }
  );

  const image = Images.findOne({
    'meta.thing': thing._id,
  }, {
    'sort': {
      'meta.insertedAt': -1
    },
  });

  const alerts = Events.find({'event.type': 'alert',
    'thing._id': thing._id}).fetch();

  const events = Events.find({'thing._id': thing._id}).fetch();

  const phEvents = Events.find({'event.type': 'ph',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  }).fetch();
  const ecEvents = Events.find({'event.type': 'ec',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  }).fetch();
  const luxEvent = Events.findOne({'event.type': 'lux',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  });
  const tempEvents = Events.find({'event.type': 'temperature',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  }).fetch();
  const humidityEvents = Events.find({'event.type': 'humidity',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  }).fetch();
  const water_temperatureEvents = Events.find({'event.type': 'water_temperature',
    'thing._id': thing._id}, {
    sort: { insertedAt: -1 }
  }).fetch();

  return {
    phEvents,
    ecEvents,
    water_temperatureEvents,
    image,
    tempEvents,
    humidityEvents,
    luxEvent,
    alerts,
    events,
    ready
  }
}, GrowMobile);
