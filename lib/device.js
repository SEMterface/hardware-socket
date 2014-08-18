
var serialport = require('serialport');
var SerialPort = serialport.SerialPort;
var async = require('async');

var lf = '\n';
var cr = '\r';

var devices = {
  'Arduino (www.arduino.cc)': {
    name: 'arduino Arduino',
    roles: ['stage', 'dev'],
    baudrate: 9600,
    idReq: 'ID',
    idRes: {'dev': 'dev', 'stage': 'stage'},
    initDelay: '3000' // Init delay in ms
  },
  'FTDI': {
    name: 'arduino FTDI',
    roles: ['stage', 'dev'],
    baudrate: 9600,
    idReq: 'ID',
    idRes: {'dev': 'dev', 'stage': 'stage'},
    initDelay: '3000'
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
  var defaultDelay = 2000;
  this.com = new SerialPort(this.comName, {
    baudrate: this.baudrate,
    parser: serialport.parsers.readline(cr)
  });
  console.log("Opening " + that.name + " in " + (that.initDelay || defaultDelay) + "ms");
  this.com.on('open', function () {
    setTimeout(onOpenCb , that.initDelay || defaultDelay); // Delay before attaching any watchers
  });

  function onOpenCb () {
    console.log(that.name + ': serial is open');
    callback(null, that);
  }
};

Device.prototype.identify = function(callback) {
  var that = this;
  var timeout;
  function startTimer (time) {
    return setTimeout(function () {
      var err =  null // new Error(that.name +' ID timed out');
      that.role = 'timeout'
      console.log(that.name + ' timed out');
      callback(err, that);
    }, time);
  }

  function createError () {
    return new Error('The ID timed out')
  }
  that.com.once('data', function (data) {
    console.log(that.name + 'responded with ID: '+ data);
    if (that.idRes[data]) {
      that.role = that.idRes[data];
      console.log(that.name + ' assigned to role ' + that.role)
      clearTimeout(timeout);
      callback(null, that);
    }
  });
  console.log("Sending " + that.name + " id Req: " + that.idReq);
  that.com.write(padString(this.idReq), function(err, results) {
    timeout = startTimer(10000);
    if (err) console.log(err);
    if (err) callback(err);
  });
};

function padString (string) {
  var prefix = lf;
  var suffix = cr;
  return [prefix, string, suffix].join('');
}

Device.createDevices = function (callback){
  async.waterfall([
    getAllPorts,
    filterPorts,
    identifyPorts,
    createDeviceObjects,
    verifyRoles,
    removeExcess
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
  callback(('role' in device) && device.role !== 'timeout');
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
