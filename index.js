// Plujin Temperature + Humidity Sensor for HomeKit - Homebridge
// Author Samuel Boix Torner
// Version 1.0.0
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
	this.currentHumidity 				= 10;
	this.CurrentTemperature 					= 20;
	//User config.
	this.http_method						= config["http_method"]					||	"GET";
	this.sendimmediately						= config["sendimmediately"]				||	"";
	this.username 							= config["username"]					||	"";
	this.password							= config["password"]					||	"";
	this.units								= config["units"]							|| 'C'
	this.availableHum 					= config["humidity"]					||	true;

	this.log(this.name, this.apiAdress);

	this.service = new Service.TemperatureSensor(this.name);
	if(this.availableHum === true) {
		this.service = new Service.HumiditySensor(this.name);
	}

}

DHT_SENSOR.prototype = {

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
						this.CurrentTemperature = parseFloat(json.temperature);
					}
					else if (this.units == 'F') {
						this.log('Current Temperature in ℉ is %s (%s)', json.temperature, this.units);
						this.CurrentTemperature = this.fToC(parseFloat(json.temperature));
					}
	        	return callback(null, this.CurrentTemperature);
	      		} else {
	        		this.log('Error getting current temp: %s', err);
	        		return callback("Error getting current temp: " + err);
	      		}
	      	   	}).bind(this));
		},

	getCurrentHumidity: function(callback) {
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
					this.CurrentRelativeHumidity = parseFloat(json.humidity);
		        		return callback(null, this.CurrentRelativeHumidity);
		      		} else {
					this.log('Error getting current humidity: %s', err);
		        		return callback("Error getting current hum: " + err);
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

			if(this.availableHum === true) {
			this.service
			.getCharacteristic(Characteristic.CurrentRelativeHumidity)
			.on('get', this.getCurrentRelativeHumidity.bind(this));

			this.service
			.getCharacteristic(Characteristic.CurrentRelativeHumidity)
			.setProps({
				maxValue: 100,
				minValue: 0,
			});

			}
			this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

			
			return [informationService, this.service];

	}

};
