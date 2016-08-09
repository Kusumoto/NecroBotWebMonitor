var map;
var wsUri = "ws://" + config.NecroBotHost + ":" + config.NecroBotPort;
var websocket;
var poly;

$(document).ready(function() {
    init();
    $('#item_menu').on("click", function() {
        websocket.send("InventoryList");
    })
    $('#pokemon_menu').on("click", function() {
        websocket.send("PokemonList");
    })
    $('#eggs_menu').on("click", function() {
        websocket.send("EggsList");
    })
})

var init = function() {
    $.getScript("https://maps.googleapis.com/maps/api/js?key=" + config.GMapAPIKey, function() {
        map = new GMaps({
            div: '#map',
            lat: 13.03887,
            lng: 101.490104,
            zoom: 6,
            scrollwheel: true
        });

        poly = map.drawPolyline({
            path: [],
            strokeColor: 'red',
            strokeOpacity: 1,
            strokeWeight: 6
        });
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) {
            console.log("CONNECTED!")
        }

        websocket.onmessage = function(evt) {
            eventselect(evt)
        };
    });
}

var eventselect = function(evt) {
    var json = JSON.parse(evt.data)
    var type = json.$type.split(',');
    console.log(type[0])
    switch (type[0]) {
        case 'PoGo.NecroBot.Logic.Event.UpdatePositionEvent':
            plotposition(json)
            break;
        case 'PoGo.NecroBot.Logic.Event.PokeStopListEvent':
            plotpokestop(json)
            break;
        case 'PoGo.NecroBot.Logic.Event.FortUsedEvent':
            break;
        case 'PoGo.NecroBot.Logic.Event.ProfileEvent':
            console.log(json)
            break;
        case 'PoGo.NecroBot.Logic.Event.InventoryListEvent':
            itemlist(json)
        default:

    }
}

var plotposition = function(json) {
    var path = poly.getPath();
    path.push(new google.maps.LatLng(json.Latitude, json.Longitude));
    poly.setPath(path);
    map.setZoom(20)
    map.setCenter(json.Latitude, json.Longitude)
}

var plotpokestop = function(json) {
    json.Forts.$values.forEach(function(item, index) {
        if (item.Type == 1) {
            map.addMarker({
                lat: item.Latitude,
                lng: item.Longitude,
                icon: "image/forts/img_pokestop.png"
            });
        }
    });
}

var itemlist = function(json) {
    var html = '';
    html += '<div class="row">'
    json.Items.$values.forEach(function(item, index) {
        html += '<div class="col-md-4">'
        html += '<center><img src="image/items/' + item.ItemId + '.png" class="img-responsive" width="100px" height="100px"/></center>'
        html += '<p class="text-center">' + item.Count + '</p>'
        html += '</div>'
    })
    html += '</div>'
    $("#itemdata").html(html);
}
