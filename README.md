# homebridge-advanced-thermostat

This is a HomeBridge plugin. Allows HomeKit to use your own Temperature + Humidity Sensor under HTTP protocol.

# Installation

You need to be root or use command "sudo" to install this packages.

*Is necessary has installed node.js with npm.

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-advanced-dht-sensor
3. Update your configuration file. See bellow for a sample. 

*note* If you are experimenting problems to install this plugin try to add "-unsafe--perm" (without ")
       - sudo npm install -g -unsafe--perm homebridge-advanced-dht-sensor -

# Configuration

Configuration sample:

 ```
    {
        "bridge": {
            ...
        },
        
        "description": "...",

        "accessories": [
            {
                "accessory": "DHT-SENSOR",
                "name": "Sensor name",
                "apiAdress": "http://url",
                "username": "user",                   // Optional
                "password": "pass"                    // Optional
                "this.http_method": "get";            // Optional
                "manufacturer": "manufacturer",       // Optional
                "model": "model",                     // Optional
                "serial_number": "serial number",     // Optional
                "humidity": "true"                 // Optional (enable or disable "false" Humidity Sensor)
                "units": "C"                // Optional (Default C = Celsius) F = Fahrenheit 
                
            }
        ],

        "platforms":[]
    }
```
# Node(API) Configuration or whatever be your Temperature Sensor platform (What the plugin expects to receive)

The `apiAdress` is used for two main calls: Get and Set data to the Thermostat. Your Node(API) should provide it

1. Get Current Temperature and Current Humidity from Temp + Hum Sensor.

  JSON Format with:
  
```
GET /dht
{
    "temperature": FLOAT_VALUE,    // Current Temperature
    "humidity": FLOAT_VALUE   // Current Humidity
}
```

