var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('/dev/cu.PL2303-0000101D', {
  baudrate: 2400,
  parser: require('serialport').parsers.readline('\r'),
  flowControl:["DTRDTS"]
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