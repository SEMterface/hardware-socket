
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var async = require('async');

var devices = {
  'Arduino (www.arduino.cc)': {
    name: 'arduino',
    roles: ['stage', 'dev'],
    baudrate: 9600,
    //call: This string is sent for identification
    idReq: 'ID',
    //id: these keys corelate to the id response
    idRes: {'dev': 'dev', 'stage': 'stage'},
    initDelay: '1500' // Init delay in ms
  },
  'FTDI': {
    name: 'arduino',
    roles: ['stage', 'dev'],
    baudrate: 9600,
    //call: This string is sent for identification
    idReq: 'ID',
    //id: these keys corelate to the id response
    idRes: {'dev': 'dev', 'stage': 'stage'},
    initDelay: '1500'
  },
  'Prolific Technology Inc.': {
    name: 'usbSerialAdapter',
    roles: ['scope'],
    baudrate: 2400,
    idReq: '',
    idRes: {'!3': 'scope'}
  },
  'Gigaware': {
    name: 'usbSerialAdapter',
    roles: ['scope'],
    baudrate: 2400,
    idReq: '',
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
    setTimeout(function () {
      console.log(that.name + ': serial is open');
      callback(null, that);
    }, that.initDelay || 2000); // Delay before attaching any watchers
  });
};

Device.prototype.identify = function(callback) {
  var that = this;
  var timeout;
  function startTimer (timer) {
    timer = setTimeout(callback, 10000);
  }
  that.com.once('data', function (data) {
    console.log('data: '+ data);
    if (that.idRes[data]) {
      that.role = that.idRes[data];
      clearTimeout(timeout);
      callback(null, that);
    }
  });
  console.log("idReq: " + that.idReq);
  that.com.write(this.idReq, function(err, results) {
    startTimer(timeout);
    console.log(err);
    console.log(results);
  });
};

function padString (string) {
  var prefix = '';
  var suffix = '\r';
  return [prefix, string, suffix].join('');
}

Device.createDevices = function (callback){
  async.waterfall([
    getAllPorts,
    filterPorts,
    identifyPorts,
    createDeviceObjects,
    verifyRoles
    //removeExcess
    ],
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

function identifyPorts (ports, callback) {
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
  device.openCom(callback);
}

function verifyRoles (devices, callback) {
  async.map(devices, verifyRole, callback);
}

function verifyRole (device, callback) {
  device.identify(callback);
}

function removeExcess (devices, callback) {
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
