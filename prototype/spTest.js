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
  dekayWriteCb(write5);
});

function dataHandler (cb) {
  sp.on("data", function(data) {
    console.log('data received: ' + data);
  });
  sp.on("error", function (err) {
    console.log('err: ' + err);
  });
  cb();
}

function dekayWriteCb (cb) {
  setTimeout(delayWrite, 1500);
  function delayWrite () {
    sp.write("Hello\n", function(err, results) {
      cb();
    });
  }
}

function testWrite (string,cb) {
  sp.write(string, function(err, results) {
    console.log('wrote hello');
    if (cb) cb();
  });
}

function id (cb) {
  sp.write("ID 10\n", function(err, results) {
    console.log('newline');
    if (cb) cb();
  });
}

function write5 () {
  testWrite("ACC\n");
  testWrite("ACC 19\n");
  testWrite("BCCT 294\n");
  testWrite("ID\n");
  id();
}