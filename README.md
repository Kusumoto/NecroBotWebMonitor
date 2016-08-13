# NOTICE!!!

NECROBOT OFFICIAL REPOSITORY IS GOING DOWN BUT SAME FUNCTION IN NOCROBOT WEBSOCKERHANDLER IS INCORRECT REQUEST. THIS PROJECT NOT RELEASE NEW VERSION, THANK YOU FOR INTEREST
---
# NecroBotWebMonitor (BETA)
Simple Web application for monitoring NecroBot (Pokemon Go Bot)

![NecroBotWebMonitor1](https://github.com/Kusumoto/NecroBotWebMonitor/raw/master/screenshot/screen1.png)
![NecroBotWebMonitor2](https://github.com/Kusumoto/NecroBotWebMonitor/raw/master/screenshot/screen2.png)
![NecroBotWebMonitor3](https://github.com/Kusumoto/NecroBotWebMonitor/raw/master/screenshot/screen3.png)
![NecroBotWebMonitor4](https://github.com/Kusumoto/NecroBotWebMonitor/raw/master/screenshot/screen4.png)
![NecroBotWebMonitor5](https://github.com/Kusumoto/NecroBotWebMonitor/raw/master/screenshot/screen5.png)

## Configuration
- Download or Clone this repository to your computer.
- Enable NecroBot web socket in configuration file.
```json
  "UseWebsocket": true,
```
- Edit file config/config.js

```js
var config = {
  'GMapAPIKey' : 'YOU GOOGLE MAP API KEY',
  'NecroBotHost' : 'localhost',
  'NecroBotPort' : 14252,
  'MapLineColor' : 'red',
  'FollowTrainer' : true,
  'MapZoomLevel' : 20
}
```
You can get Google Map API key from => https://developers.google.com/maps/documentation/javascript/get-api-key

- Open file index.html or push this project to your web server (if you need to remote monitor)
