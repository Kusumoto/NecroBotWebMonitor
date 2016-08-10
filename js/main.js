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
    $('#profile_menu').on("click", function() {
        websocket.send("{ Command : 'GetTrainerProfile' }");
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
        websocket.onerror = function(evt) {
            alert("Error : Websocket connection error!")
        };
    });
}

var eventselect = function(evt) {
    var json = JSON.parse(evt.data)
    var type = json.$type.split(',');
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
            break;
        case 'PoGo.NecroBot.CLI.WebSocketHandler.GetCommands.Events.TrainerProfileResponce':
            homeprofile(json);
            break;
        case 'PoGo.NecroBot.Logic.Event.PokemonCaptureEvent':
            console.log(json)
            break;
        default:

    }
}

var plotposition = function(json) {
    var path = poly.getPath();
    path.push(new google.maps.LatLng(json.Latitude, json.Longitude));
    poly.setPath(path);

    if (!isfirstplot || config.FollowTrainer) {
        map.setZoom(config.MapZoomLevel)
        map.setCenter(json.Latitude, json.Longitude)
        isfirstplot = true
    }
    websocket.send("{ Command : 'GetTrainerProfile' }");
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

var homeprofile = function(json) {
    var xpTable = [
        0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
        10000, 10000, 10000, 10000, 15000, 20000, 20000, 20000, 25000, 25000,
        50000, 75000, 100000, 125000, 150000, 190000, 200000, 250000, 300000, 350000,
        500000, 500000, 750000, 1000000, 1250000, 1500000, 2000000, 2500000, 3000000, 5000000
    ];
    var level = parseInt(json.Data.Stats.Level);
    var totalexp = (parseInt(json.Data.Stats.Experience) - parseInt(json.Data.Stats.PrevLevelXp) - xpTable[level - 1]);
    var levelupexp = (parseInt(json.Data.Stats.NextLevelXp) - parseInt(json.Data.Stats.PrevLevelXp) - xpTable[level - 1]);
    var percentageexp = ((totalexp / levelupexp) * 100).toFixed(2);
    var percentageatt = (parseInt(json.Data.Stats.BattleAttackWon) / (parseInt(json.Data.Stats.BattleAttackTotal)) * 100).toFixed(2);
    var percentagetra = (parseInt(json.Data.Stats.BattleTrainingWon) / (parseInt(json.Data.Stats.BattleTrainingTotal)) * 100).toFixed(2);
    $("#bar_exp").css("width", percentageexp + "%")
    $("#bar_exp_txt").text(percentageexp + "%")
    $("#bar_att").css("width", percentageatt + "%")
    $("#bar_att_txt").text(percentageatt + "%")
    $("#bar_tra").css("width", percentagetra + "%")
    $("#bar_tra_txt").text(percentagetra + "%")

    switch (json.Data.Profile.Team) {
        case 0:
            $("#team_data").prop('src', 'image/forts/TeamLess.png')
            $("#model_team").prop('src', 'image/forts/TeamLess.png')
            break;
        case 1:
            $("#team_data").prop('src', 'image/forts/Mystic.png')
            $("#model_team").prop('src', 'image/forts/Mystic.png')
            break;
        case 2:
            $("#team_data").prop('src', 'image/forts/Valor.png')
            $("#model_team").prop('src', 'image/forts/Valor.png')
            break;
        case 3:
            $("#team_data").prop('src', 'image/forts/Instinct.png')
            $("#model_team").prop('src', 'image/forts/Instinct.png')
            break;
    }
    $("#name_data").text(json.Data.Profile.Username);
    $("#level_data").text("Level : " + json.Data.Stats.Level)
    $("#exp_data").text("EXP : (" + totalexp + "/" + levelupexp + ")")

    $("#model_username").text(json.Data.Profile.Username);
    $("#model_level").text("Level : " + json.Data.Stats.Level);
    $("#model_maxitem").text(json.Data.Profile.MaxItemStorage);
    $("#model_maxpok").text(json.Data.Profile.MaxPokemonStorage);
    $("#model_bat").text(json.Data.Stats.BattleAttackTotal);
    $("#model_baw").text(json.Data.Stats.BattleAttackWon);
    $("#model_bdw").text(json.Data.Stats.BattleDefendedWon);
    $("#model_btt").text(json.Data.Stats.BattleTrainingTotal);
    $("#model_btw").text(json.Data.Stats.BattleTrainingWon);
    $("#model_txtexp").text(totalexp + "/" + levelupexp);
}
