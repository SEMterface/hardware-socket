
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var async = require('async');

var devices = {
  'Arduino (www.arduino.cc)': {
    name: 'arduino',
    roles: ['stage', 'dev'],
    baudrate: 9600,
    //call: This string is sent for identification
    idReq: '\r',
    //id: these keys corelate to the id response
    idRes: {'dev': 'dev', 'stage': 'stage'}
  },
  'Prolific Technology Inc.': {
    name: 'usbSerialAdapter',
    roles: ['scope'],
    baudrate: 2400,
    idReq: '\r',
    idRes: {'!3': 'scope'}
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
    callback();
  });
};

Device.prototype.identify = function(callback) {
  var that = this;
  var timeout;
  function startTimer (timer) {
    timer = setTimeout(callback, 1000);
  }
  this.com.once('data', function (data) {
    if (that.id[data]) {
      that.role = that.id[data];
      clearTimeout(timeout);
      callback();
    }
  });
  this.com.write(this.call, startTimer(timeout));
};

Device.createDevices = function (callback){
  async.waterfall([
    getAllPorts,
    filterPorts,
    identifyPort,
    createDeviceObjects,
    verifyRoles,
    removeExcess],
    callback
  );
};

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

function createDevice (port, callback) {
  var device = new Device(port);
  device.openCom(function () {
    callback(null, device);
  });
}

function verifyRoles (devices, callback) {
  async.each(devices, verifyRole, callback);
}

function verifyRole (device, callback) {
  device.identify(callback(null));
}

function removeExcess (devies, callback) {
  async.filter(devices, remove, callback);
}

function remove (device, callback) {
  callback('role' in device);
}


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
