//(Line feed, '\n', 0x0A, 10 in decimal <----
//CR (Carriage return, '\r', 0x0D, 13 in decimal)
// (CR+LF, '\r\n', 0x0D0A)

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var sp = new SerialPort("COM3", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
}, false); // this is the openImmediately flag [default is true]

sp.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    sp.on("data", function(data) {
      console.log('data received: ' + data);
    });
    sp.write("Omg this is a string\n", function(err, results) {
      console.log('err ' + err);
      console.log('results '+ results);
    });
  }
});

sp.on("error", function (err) {
  console.log(err);
});