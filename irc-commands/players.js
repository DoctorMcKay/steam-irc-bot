var ACCESS_PUBLIC = 0;
var ACCESS_ADMIN = 1;
var ACCESS_SENIOR_ADMIN = 2;
var ACCESS_ROOT = 3;

var Steam = require('steam');

module.exports = function(prefixMsg) {
	return {
		"triggers": ["players", "numplayers"],
		"description": "Get the number of players currently playing a specified Steam game",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				prefixMsg(channel, sender.nick, "Usage: numplayers <appid|name regex>");
				return;
			}
			
			var appid = parseInt(args.raw, 10);
			if(isNaN(appid)) {
				appid = require.main.exports.steamFindAppByName(args.raw);
				if(!appid) {
					prefixMsg(channel, sender.nick, "No matching app found.");
					return;
				}
			}
			
			require.main.exports.steam.getNumberOfCurrentPlayers(appid, function(result, players) {
				if(result != Steam.EResult.OK) {
					var eresult = result;
					for(var i in Steam.EResult) {
						if(Steam.EResult[i] == result) {
							eresult = i;
							break;
						}
					}
					
					prefixMsg(channel, sender.nick, "Error: " + eresult);
				} else {
					prefixMsg(channel, sender.nick, (appid === 0 ? "Steam users" : require.main.exports.steamAppName(appid) + " (" + appid + ") players") + ": " + players.format());
				}
			});
		}
	};
};