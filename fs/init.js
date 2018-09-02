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

//Voltage Address
let i2cDevAdd = 0x40;

//Config Register (Read/Warite)
let INA3221_REG_CONFIG = 0x00;

//BUS VOLTAGE REGISTER (Read)
let INA3221_REG_BUSVOLT = 0x02;

print('LED GPIO   :', onBoardLed);
print('Relay GPIO :', relayPin);
print('ACS712 GPIO:', ACS712Pin);


/*INA3221 Voltage Reader and Config settings
let readVolt = function(ch) {

  let add = INA3221_REG_BUSVOLT;

  add += (ch-1) *2;
  print('Current Add:', add);

  let data = (I2C.readRegB(i2c, i2cDevAdd, add) << 8);
  print('Current Data:', data);

  let retData = data * 0.001;
  return retData;
};

/*let setSettingsINA3221 = function() {
  let val = 0x4000 |
            0x2000 |
            0x0100 |
            0x0020 |
            0x0004 |
            0x0002 |
            0x0001;
  I2C.writeRegW(i2c, i2cDevAdd, INA3221_REG_CONFIG, val);
};
*/

/*Read INA219 Data*/
let readVolt = function() {
  let data = (I2C.readRegB(i2c, i2cDevAdd, 0x02) << 5) * 4;
  print('Current Data:', data);

  let retData = data * 0.001;
  return retData;
};

/*ACS712 Amp Reader*/
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


/*RPC Handler*/
RPC.addHandler('Volt.Read', function(args) {

  return readVoltFunc({ value: JSON.stringify(readVolt()) });
});
/*
RPC.addHandler('Volt.Read2', function(args) {

  return { value: JSON.stringify(readVolt(2)) };
});
*/
RPC.addHandler('Amp.Read', function(args) {
  return readAmpFunc({ value: JSON.stringify(readAmp()) });
});

/*
RPC.addHandler('I2C.setConfINA3221', function() {
  setSettingsINA3221();
  return { value: JSON.stringify(true) };
});
*/



Timer.set(1000 /* 1 sec */, Timer.REPEAT, function() {
  //print(readAmp());
}, null);
