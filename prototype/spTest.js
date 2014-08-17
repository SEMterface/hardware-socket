//(Line feed, '\n', 0x0A, 10 in decimal <----
//CR (Carriage return, '\r', 0x0D, 13 in decimal)
// (CR+LF, '\r\n', 0x0D0A)

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor
var async = require('async');

var sp = new SerialPort("COM3", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
}); // this is the openImmediately flag [default is true]

sp.on("open", function () {
  console.log('open');
  sp.on("data", function(data) {
    console.log('data received: ' + data);
  });
  sp.on("error", function (err) {
    console.log('err: ' + err);
  });
  initDelay(write5);
});

function initDelay (cb) {
  setTimeout(cb, 1500);
}

function testWrite (string,cb) {
  sp.write(padString(string), function(err, results) {
    if (err) console.log(err);
    if (results) console.log(results);
    if (cb) cb();
  });
}

function write5 () {
  testWrite("ACC");
  testWrite("ACC 19");
  testWrite("BCCT");
  testWrite("BcCt 294");
  testWrite("BCCT");
}


function padString (string) {
  var prefix = '';
  var suffix = '\n';
  return [prefix, string, suffix].join('');
}