var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/cu.PL2303-0000101D", {
  baudrate: 2400,
  parser: require("serialport").parsers.readline("\r")
}, false); // this is the openImmediately flag [default is true]

serialPort.open(function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write("ACC\n", function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});

var replify = require('replify');

replify('sempl', serialPort, { 'serialPort': serialPort });