var SteamUser = require('steam-user');

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
			
			require.main.exports.steam.getPlayerCount(appid, function(result, players) {
				if(result != SteamUser.EResult.OK) {
					prefixMsg(channel, sender.nick, "Error getting player count for " + require.main.exports.steamAppName(appid) + " (" + appid + "): " + (SteamUser.EResult[result] || result));
				} else {
					prefixMsg(channel, sender.nick, (appid === 0 ? "Steam users" : require.main.exports.steamAppName(appid) + " (" + appid + ") players") + ": " + players.format());
				}
			});
		}
	};
};