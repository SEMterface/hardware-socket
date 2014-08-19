//NPM Provided
//var serialport = require('serialport');
//var SerialPort = serialport.SerialPort;
var ioclient = require('socket.io-client');

// Internal Modules
//var stage = require('./lib/stage');
//var scope = require('./lib/scope');
var Device = require('./lib/device');
var devices;
var stage;
var stageCommands = require('./lib/stage');
var scope;
var replify = require('replify');

// State variables
//var connectedDevices = [];

// Socket client connection.
var socket = ioclient.connect('http://semterface.herokuapp.com/');
//socket = ioclient.connect('http://semterface.aws.af.cm/');

socket.on('news', function (data) {
      console.log(data);
});


Device.createDevices(function(err, result) {
  devices = result;
  console.log('Final Results:')
  console.log(result);
  if (err) console.log(err);

  for (item in devices) {
    if (item.role == 'scope') {
      scope = item;
    }
    if (item.role == 'stage') {
      stage = item;


      stage.on('data', function(data) {
        console.log('data received: ' + data);
      });
      socket.on('stage', function (request) {
        console.log('Stage Req:' + request);
        stage.write(stageCommands[request.move]);
      });
    }
  }
});

//    console.log([port.comName, port.pnpId, port.manufacturer]);
//    var device = devices[port.manufacturer];
//    if (device) {
//      console.log(device.name + ' found!');
//      //Initialize the
//    }

//console.log('Stage Control started.');
//var stageCom = new SerialPort(stagePortName, {
//    baudrate: 9600
//});
//
//var scopeCom = new SerialPort(scopePortName, {
//    baudrate: 2400
//});

//stageCom.on('open', function () {
//    console.log('stageCom is open');
//    stageCom.on('data', function(data) {
//    console.log('data received: ' + data);
//  });
//});
//
//scopeCom.on('open', function () {
//  console.log('scopeCom is open');
//  scopeCom.on('data', function (received) {
//    console.log('scopeCom: ' + received);
//  });
//});
//
//socket.on('stage', function (request) {
//  console.log('Stage Req:' + request);
//  stageCom.write(stage[request.move]);
//});
//
//socket.on('scope', function (request) {
//  console.log('Scope Req: ' + request);
//  scope[request];
//});//