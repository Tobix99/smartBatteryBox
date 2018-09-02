load('api_config.js');
load('api_gpio.js');
load('api_i2c.js');
load('api_adc.js');
load('api_rpc.js');
load('api_timer.js');


let onBoardLed = Cfg.get('pins.led');
let relayPin = Cfg.get('pins.relayOnboard');
let ACS712Pin = Cfg.get('pins.ACS712');

let i2c = I2C.get_default();

let lastAmp = 0;

print('LED GPIO   :', onBoardLed);
print('Relay GPIO :', relayPin);
print('ACS712 GPIO:', ACS712Pin);

RPC.addHandler('Volt.Read', function(args) {

  return { value: JSON.stringify(readVolt()) };
});

RPC.addHandler('Amp.Read', function(args) {
  return { value: JSON.stringify(readAmp()) };
});

let readVolt = function(args) {
  let data = I2C.readRegB(i2c, 0x40, 0x02+args.ch-1);
  let retData = data * 0.001;
  return retData;
};

let readAmp = function() {
  let currentVal = ADC.read(ACS712Pin);
  let currentAmpere = ((-0.048828*currentVal+40.6738)+lastAmp)/2;
  if(currentAmpere < 0)
  {
    currentAmpere = 0;
  }
  lastAmp = currentAmpere;
  return currentAmpere;
  
};

Timer.set(1000 /* 1 sec */, Timer.REPEAT, function() {
  print(readAmp());
}, null);