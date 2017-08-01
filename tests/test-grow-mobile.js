const Thing = require('Grow.js');
const inquirer = require('inquirer');
const _ = require('underscore')

var args = process.argv.slice(2);
var uuid = args[0];
var token = args[1];

var questions = [
  {
    type: 'input',
    name: 'uuid',
    message: 'Enter device UUID (you are given this when you create a new thing)',
  },
  {
    type: 'input',
    name: 'token',
    message: 'Enter token',
  },
];

if(_.isUndefined(uuid) || _.isUndefined(token)) {
  inquirer.prompt(questions).then(function (answers) {
    uuid = answers.uuid;
    token = answers.token;
    growHub = createGrowHub(uuid, token);
  });
} else {
  growHub = createGrowHub(uuid, token);
}

// Create a new growHub instance and connect to server running on localhost
function createGrowHub(u, t) {
  return new Thing({
    uuid: u,
    token: t,
    component: 'GrowMobile',

    // Properties can be updated by the API
    properties: {
      state: 'off',
      light_state: 'off',
      fan_state: 'off',
      pump_state: 'off',
      threshold: 300,
      interval: 3000,
      currently: null,
      lightconditions: null
    },

    start: function () {
      console.log('Grow-Mobile initialized.');

      let interval = this.get('interval');

      emit_and_analyze = setInterval(()=> {
        this.temp_data();
        this.hum_data();
        this.ph_data();
        this.ec_data();
        this.lux_data();
        this.water_temp_data();
      }, interval);


      // Here we use timeouts to emit messages after a certain amount of delay.
      setTimeout(()=>{
        this.emit('message', 'Analyzing environment conditions...');
      }, 3300)

      setTimeout(()=>{
        this.emit('message', 'All good');
      }, 5000)

      setTimeout(()=>{
        this.emit('message', 'Analyzing plant images with computer vision');
      }, 10000)
    },

    stop: function () {
      console.log("Grow-Hub stopped.");
      clearInterval(emit_and_analyze);
      this.removeAllListeners();
    },

    day: function () {
      this.emit('message', 'It is day!');
    },

    night: function () {
      this.emit('message', 'It is night!');
    },

    ec_data: function () {
      eC_reading = 434 + Math.random() * 10;

      this.emit('ec', eC_reading);

      console.log('Conductivity: ' + eC_reading);
    },

    ph_data: function () {
      pH_reading = 7 + Math.random();

      this.emit('ph', pH_reading);

      console.log('ph: ' + pH_reading);
    },

    temp_data: function () {
      let currentTemp = 21 + Math.random();

      this.emit('temperature', currentTemp);

      console.log('Temp: ' + currentTemp);
    },

    water_temp_data: function () {
      let currentTemp = 20 + Math.random();

      this.emit('water_temperature', currentTemp);

      console.log('Temp: ' + currentTemp);
    },

    lux_data: function () {
      let lux = 100 + Math.random();

      this.emit('lux', lux);

      console.log('Lux: ' + lux);
    },

    hum_data: function () {
      let currentHumidity = 50 + Math.random();

      this.emit('humidity', currentHumidity);

      console.log("Humidity: " + currentHumidity);
    }
  }).connect();
}
