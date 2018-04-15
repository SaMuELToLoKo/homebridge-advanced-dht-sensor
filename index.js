// Plujin Temperature + Humidity Sensor for HomeKit - Homebridge
// Author Samuel Boix Torner
// Version 1.0.7  // With Battery Status
//
//
// This plujin allow to our Homebridge to manage a Temperature + Huidity Sensor instance in our own application.

//Program
var Service, Characteristic;
var request = require('request');

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-advanced-dht-sensor", "DHT-SENSOR", DHT_SENSOR);
};


function DHT_SENSOR(log, config) {

	//Generic Config.
	this.log 							= log;
	this.apiAdress 							= config["apiAdress"];
	this.name 							= config["name"]					||	"Temp + Hum Sensor";
	this.manufacturer						= config["manufacturer"]				||	"User-DHT";
	this.model							= config["model"]					||	"Homebridge-Dht-Sensor";
	this.serial_number						= config["serial_number"]				||	"XXX.XXX.XXX.XXX";
	//Specific config.
	this.currentTemperature 					= 20;
	//User config.
	this.http_method						= config["http_method"]					||	"GET";
	this.sendimmediately						= config["sendimmediately"]				||	"";
	this.username 							= config["username"]					||	"";
	this.password							= config["password"]					||	"";
	this.units								= config["units"]							|| 'C'
	this.availableHum 					= config["humidity"]					||	true;
	this.battery								= config["battery"]						||	false;

	this.log(this.name, this.apiAdress);

	this.service = new Service.TemperatureSensor(this.name);
	if(this.availableHum === true) {
		this.currentRelativeHumidity	= 10;
		this.humService = new Service.HumiditySensor(this.name);
	}
	if(this.battery === true) {
		this.batteryLevel	= 80;
		this.chargingState	= 0;
		this.lowStatus	= 0;
		this.batService	= new Service.BatteryService(this.name);
	}

}

DHT_SENSOR.prototype = {

	cToF: function(value) {
        return Number((9 * value / 5 + 32).toFixed(0));
  },
  fToC: function(value) {
    		return Number((5 * (value - 32) / 9).toFixed(2));
	},

	identify: function(callback) {
		this.log('Identify requested!');
		return callback(); // succes
	},


	getCurrentTemperature: function(callback) {
			this.log('Getting Current Temperature from: ', this.apiAdress + '/dht');
			return request.get({
				url: this.apiAdress + '/dht',
				auth: {
				user: this.username,
				pass: this.password
			}
			}, (function(err, response, body) {
				var json;
				if (!err && response.statusCode === 200) {
	       		this.log('response success');
	        	json = JSON.parse(body);
					if (this.units == 'C'){
						this.log('Current Temperature in ℃ is %s (%s)', json.temperature, this.units);
						this.currentTemperature = parseFloat(json.temperature);
					}
					else if (this.units == 'F') {
						this.log('Current Temperature in ℉ is %s (%s)', json.temperature, this.units);
						this.currentTemperature = this.fToC(parseFloat(json.temperature));
					}
	        	return callback(null, this.currentTemperature);
	      	} else {
	        		this.log('Error getting current temp: %s', err);
	        		return callback("Error getting current temp: " + err);
	      	}
	      }).bind(this));
		},

	getCurrentRelativeHumidity: function(callback) {
	 		this.log('Getting Current Humidity from:', this.apiAdress + '/dht');
			return request.get({
				url: this.apiAdress + '/dht',
				auth: {
					user: this.username,
					pass: this.password
				}
			}, (function(err, response, body) {
				var json;
				if (!err && response.statusCode === 200) {
		        		this.log('response success');
		        		json = JSON.parse(body);
		        		this.log('Current Humidity is %s', json.humidity);
					this.currentRelativeHumidity = parseFloat(json.humidity);
		        		return callback(null, this.currentRelativeHumidity);
		      		} else {
					this.log('Error getting current humidity: %s', err);
		        		return callback("Error getting current hum: " + err);
		      		}
		   	}).bind(this));
	 },

	 getBatteryLevel: function(callback) {
		 		this.log('Getting Current Battery Level from:', this.apiAdress + '/battery');
		 		return request.get({
			 					url: this.apiAdress + '/battery',
			 					auth: {
				 				user: this.username,
				 				pass: this.password
			 					}
		 		 }, (function(err, response, body) {
			 	 				var json;
			 					if (!err && response.statusCode === 200) {
							 			this.log('response success');
					 					json = JSON.parse(body);
							 			this.log('Current Battery Level is: %s', json.level);
				 						this.batteryLevel = parseInt(json.level);
							 			return callback(null, this.batteryLevel);
						 		} else {
				 						this.log('Error getting current Battery Level: %s', err);
							 			return callback("Error getting battery level: " + err);
						 		}
			 			}).bind(this));
	},

	getChargingState: function(callback) {
		this.log('Getting Current Charging State from:', this.apiAdress + '/battery');
		return request.get({
						url: this.apiAdress + '/battery',
						auth: {
						user: this.username,
						pass: this.password
						}
		 }, (function(err, response, body) {
						var json;
						if (!err && response.statusCode === 200) {
								this.log('response success');
								json = JSON.parse(body);
								this.log('Current Charging State is: %s', json.charging);
								this.chargingState = parseInt(json.charging);
								return callback(null, this.chargingState);
						} else {
								this.log('Error getting current Charging State: %s', err);
								return callback("Error getting charging state: " + err);
						}
				}).bind(this));
},

	getLowStatus: function(callback) {
		this.log('Getting Low Status Battery from:', this.apiAdress + '/battery');
		return request.get({
						url: this.apiAdress + '/battery',
						auth: {
						user: this.username,
						pass: this.password
						}
		 }, (function(err, response, body) {
						var json;
						if (!err && response.statusCode === 200) {
								this.log('response success');
								json = JSON.parse(body);
								this.log('Low Battery Status is: %s', json.low);
								this.lowStatus = parseInt(json.low);
								return callback(null, this.lowStatus);
						} else {
								this.log('Error getting low battery status State: %s', err);
								return callback("Error getting low battery status: " + err);
						}
				}).bind(this));
},

 	getName: function(callback) {
	 		var error;
	 		this.log('getName :', this.name);
	 		error = null;
	 		return callback(error, this.name);
 	},

	getServices: function() {

			var informationService = new Service.AccessoryInformation();

			informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serial_number);

			this.service
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this));

			this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

			if(this.availableHum === true) {
					this.humService
					.getCharacteristic(Characteristic.CurrentRelativeHumidity)
					.on('get', this.getCurrentRelativeHumidity.bind(this));

					this.humService
					.getCharacteristic(Characteristic.CurrentRelativeHumidity)
					.setProps({
							maxValue: 100,
							minValue: 0,
					});
			}

			if(this.battery === true) {
					this.batService
					.getCharacteristic(Characteristic.BatteryLevel)
					.on('get', this.getBatteryLevel.bind(this));

			this.batService
      		.getCharacteristic(Characteristic.ChargingState)
      		.on('get', this.getChargingState.bind(this));

			this.batService
      		.getCharacteristic(Characteristic.StatusLowBattery)
      		.on('get', this.getLowStatus.bind(this));
		  }

			if(this.battery === false && this.availabeHum === true) {
					return [informationService, this.service, this.humService];
			}

			else if(this.battery === true && this.availabeHum === false) {
					return [informationService, this.service, this.batService];
			}

			else if(this.battery === true && this.availabeHum === true) {
					return [informationService, this.service, this.humService, this.batService];
			}

			else {
					return [informationService, this.service];
			}
	}

};
