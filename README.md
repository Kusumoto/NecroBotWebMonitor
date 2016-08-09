# NecroBotWebMonitor (BETA)
Simple Web application for monitoring NecroBot (Pokemon Go Bot)

![NecroBotWebMonitor](https://s10.postimg.org/tpbw5qsk9/screenshort.png)

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
  'NecroBotPort' : 14252
}
```
You can get Google Map API key from => https://developers.google.com/maps/documentation/javascript/get-api-key

- Open file index.html or push this project to your web server (if you need to remote monitor)
