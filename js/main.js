var map;
var wsUri = "ws://" + config.NecroBotHost + ":" + config.NecroBotPort;
var websocket;
var poly;
var isfirstplot = false;

$(document).ready(function() {
    init();
    $('#item_menu').on("click", function() {
        $("#itemdata").html('<center><img src="image/loading.svg"></center>')
        websocket.send("InventoryList");
    })
    $('#pokemon_menu').on("click", function() {
        $("#pokdata").html('<center><img src="image/loading.svg"></center>')
        websocket.send("PokemonList");
    })
    $('#eggs_menu').on("click", function() {
        $("#pokegg").html('<center><img src="image/loading.svg"></center>')
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
            strokeColor: config.MapLineColor,
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
        case 'PoGo.NecroBot.Logic.Event.InventoryListEvent':
            itemlist(json)
            break;
        case 'PoGo.NecroBot.Logic.Event.PokemonListEvent':
            pokemonlist(json)
            break;
        case 'PoGo.NecroBot.Logic.Event.EggsListEvent':
            eggdata(json);
        default:

    }
}

var plotposition = function(json) {
    var path = poly.getPath();
    path.push(new google.maps.LatLng(json.Latitude, json.Longitude));
    poly.setPath(path);

    if (!isfirstplot || config.FollowTrainer) {
        map.setZoom(18)
        map.setCenter(json.Latitude, json.Longitude)
        isfirstplot = true
    }
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
        html += '<center>' + itempok[item.ItemId] + '</center>'
        html += '<p class="text-center">' + item.Count + '</p>'
        html += '</div>'
    })
    html += '</div>'
    $("#itemdata").html(html);
}

var pokemonlist = function(json) {
    var html = '';
    html += '<div class="row">'
    json.PokemonList.$values.forEach(function(item, index) {
        html += '<div class="col-md-4">'
        if (item.Item1.PokemonId.toString().length === 3) {
            html += '<center><img src="image/pokemon/' + item.Item1.PokemonId + '.png" class="img-responsive" width="100px" height="100px"/></center>'
        } else if (item.Item1.PokemonId.toString().length === 2) {
            html += '<center><img src="image/pokemon/0' + item.Item1.PokemonId + '.png" class="img-responsive" width="100px" height="100px"/></center>'
        } else {
            html += '<center><img src="image/pokemon/00' + item.Item1.PokemonId + '.png" class="img-responsive" width="100px" height="100px"/></center>'
        }
        html += '<p class="text-center">' + pokemondata[item.Item1.PokemonId - 1].Name + '</p>'
        html += '<p class="text-center">CP : ' + item.Item1.Cp + '</p>'
        html += '</div>'
    })
    html += '</div>'
    $("#pokdata").html(html);
}

var eggdata = function(json) {
    var html = '';
    var correntwalk = json.PlayerKmWalked;
    html += '<div class="row">'
    json.Incubators.$values.forEach(function(item, index) {
        html += '<div class="col-md-4">'
        if (item.ItemId != 901) {
            html += '<center><img src="image/items/EggIncubatorUnlimited.png" class="img-responsive" width="100px" height="100px"/></center>'
            html += '<center>Uses Remaining : ' + item.UsesRemaining + '</center>'
        } else {
            html += '<center><img src="image/items/EggIncubator.png" class="img-responsive" width="100px" height="100px"/></center>'
            html += '<center>Uses Remaining : Unlimited</center>'
        }
        html += '<p class="text-center">' + parseInt(correntwalk - item.StartKmWalked) + ' Km / ' + parseInt(item.TargetKmWalked - item.StartKmWalked) + ' Km</p>'
        html += '</div>'
    })

    json.UnusedEggs.$values.forEach(function(item, index) {
        html += '<div class="col-md-4">'
        html += '<center><img src="image/items/Egg.png" class="img-responsive" width="100px" height="100px"/></center>'
        html += '<p class="text-center">' + parseInt(item.EggKmWalkedTarget) + ' Km / ' + parseInt(item.EggKmWalkedTarget) + ' Km</p>'
        html += '</div>'
    })
    html += '</div>'

    $("#pokegg").html(html);
}
