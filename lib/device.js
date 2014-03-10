
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var async = require('async');

var devices = {
  'Arduino (www.arduino.cc)': {
    name: 'arduino',
    roles: ['stage', 'dev'],
    baudrate: 9600
  },
  'Prolific Technology Inc.': {
    name: 'usbSerialAdapter',
    roles: ['scope'],
    baudrate: 2400
  }
};

module.exports = Device;

function Device(obj) {
  for (var key in obj) {
    this[key] = obj[key];
  }
}

Device.prototype.openCom = function(callback) {
  var that = this;
  this.com = new SerialPort(this.comName, { baudrate: this.baudrate });
  this.com.on('open', function () {
    console.log(that.name + ': serial is open');
    that.com.on('data', function (data) {
      console.log('data: ' + data);
    });
    that.com.write('ACC\r');
    that.com.write('\r');
    callback();
  });
};

Device.createDevices = function (callback){
  async.waterfall([
    getAllPorts,
    filterPorts,
    identifyPort,
    createDeviceObjects
    //verifyRole
    //removeExcess
    ],
    callback
  );
};


//  Listing all ports tends to get me a list like this:
//  ************************************
//[ { comName: '/dev/cu.PL2303-0000101D',
//    manufacturer: 'Prolific Technology Inc.',
//    serialNumber: '',
//    pnpId: '',
//    locationId: '0x1d100000',
//    vendorId: '0x05ad',
//    productId: '0x0fba' },
//  { comName: '/dev/cu.Bluetooth-PDA-Sync',
//    manufacturer: '',
//    serialNumber: '',
//    pnpId: '',
//    locationId: '',
//    vendorId: '',
//    productId: '' },
//  { comName: '/dev/cu.Bluetooth-Modem',
//    manufacturer: '',
//    serialNumber: '',
//    pnpId: '',
//    locationId: '',
//    vendorId: '',
//    productId: '' } ]


function getAllPorts (callback) {
  serialport.list(function (err, ports) {
    if (err) callback(err);
    callback(null, ports);
  });
}

function filterPorts (ports, callback) {
  async.filter(ports, knownDeviceTest, function (results) {
    callback(null, results);
  });
}

function knownDeviceTest (port, callback) {
  callback(port.manufacturer in devices);
}

function identifyPort (ports, callback) {
  async.map(ports, mapDevicePort, callback);
}

function mapDevicePort (port, callback) {
  for (var key in devices[port.manufacturer]) {
    port[key] = devices[port.manufacturer][key];
  }
  callback(null, port);
}

function createDeviceObjects (ports, callback) {
  async.map(ports, createDevice, callback);
}
"\r"
function createDevice (port, callback) {
  var device = new Device(port);
  device.openCom(function () {
    callback(null, device);
  });
}

//function verifyRoles (deviceObjects) {
//  async.map(deviceObjects, queryDevice)
//}
//
//function verifyRole (deviceObject, callback) {
//  deviceObject.write()
//}
//}
//