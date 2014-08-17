var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('COM5', {
  baudrate: 2400,
  parser: require('serialport').parsers.readline('\r'),
}, true); // this is the openImmediately flag [default is true]

serialPort.on('open', function () {
  console.log('open');
  serialPort.on('data', function(data) {
    console.log('data received: ' + data);
  });
  serialPort.write('ACC\r', function(err, results) {
    console.log('err ' + err);
    console.log('results ' + results);
  });
});