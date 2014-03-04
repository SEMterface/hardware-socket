//NPM Provided
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var ioclient = require('socket.io-client');

// Internal Modules
var stage = require('./lib/stage');
var scope = require('/lib/scope');

// Socket client connection.
var socket = ioclient.connect('http://semterface.herokuapp.com/');
//socket = ioclient.connect('http://semterface.aws.af.cm/');
socket.on('news', function (data) {
      console.log(data);
});

var devArduino;
var stageArduino;
var scopeSerial;

switch (process.platform) {
  case 'darwin':
    devArduino = '/dev/tty.usbserial-A800ewsy';
    stageArduino = '/dev/tty.usbmodem3d11';
    scopeSerial = '/dev/tty.PL2303-0000101D';
  break;

  case 'windows':
    devArduino = 'COM3';
    stageArduino = 'COM3';
    scopeSerial = 'COM5';
  break;
}


serialport.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});


console.log('Stage Control started.');
var stageCom = new SerialPort(stagePortName, {
    baudrate: 9600
});

var scopeCom = new SerialPort(scopePortName, {
    baudrate: 2400
});

stageCom.on('open', function () {
    console.log('stageCom is open');
    stageCom.on('data', function(data) {
    console.log('data received: ' + data);
  });
});

scopeCom.on('open', function () {
  console.log('scopeCom is open');
  scopeCom.on('data', function (received) {
    console.log('scopeCom: ' + received);
  });
});

socket.on('control', function (data) {
    console.log(data);
    switch(data.move) {
    case 'up':
    stageCom.write(stage.up);
    break;
    case 'down':
    stageCom.write(stage.down);
    break;
    case 'right':
    stageCom.write(stage.right);
    break;
    case 'left':
    stageCom.write(stage.left);
    break;
    case 'Read':
    scopeCom.write('ACC\r', function(err, results) {
        console.log('err ' + err);
        console.log('results ' + results);
    });
    break;
    }
});