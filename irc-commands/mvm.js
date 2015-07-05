// Precompute vanity tour and mission names
var g_Tours = {};

function computeNames() {
	var schema = require.main.exports.tf2.itemSchema;
	if(!schema || !require.main.exports.tf2.lang) {
		return;
	}
	
	Object.keys(schema.mvm_tours).forEach(function(tour) {
		if(!schema.mvm_tours[tour].tour_name) {
			return;
		}
		
		var name = require.main.exports.tf2.lang[schema.mvm_tours[tour].tour_name.substring(1)];
		if(!name) {
			return;
		}
		
		var tokenified = name.replace(/^Operation /, '').replace(/'/g, '').replace(/[^A-Za-z0-9]/g, '_').toLowerCase();
		
		var tourObj = {
			"name": name,
			"missions": {}
		};
		
		Object.keys(schema.mvm_tours[tour].missions).forEach(function(missionMapName) {
			var parts = missionMapName.split('_');
			var map = parts.slice(0, parts.length - 1).join('_');
			
			if(!schema.mvm_maps[map] || !schema.mvm_maps[map].missions || !schema.mvm_maps[map].missions[missionMapName] || !schema.mvm_maps[map].missions[missionMapName].display_name) {
				return;
			}
			
			var missionName = require.main.exports.tf2.lang[schema.mvm_maps[map].missions[missionMapName].display_name.substring(1)];
			if(!missionName) {
				return;
			}
			
			var tokenifiedMission = missionName.replace(/'/g, '').replace(/[^A-Za-z0-9]/g, '_').toLowerCase();
			tourObj.missions[tokenifiedMission] = {
				"map": map,
				"missionMapName": missionMapName,
				"name": missionName
			};
		});
		
		g_Tours[tokenified] = tourObj;
	});
}

require.main.exports.tf2.on('connectedToGC', computeNames);
require.main.exports.tf2.on('itemSchemaLoaded', computeNames);
computeNames();

module.exports = function(prefixMsg) {
	return {
		"triggers": ["mvm"],
		"description": "Get various info about MvM Mann Up tours, missions, and games",
		"callback": function(sender, args, channel) {
			if(!require.main.exports.tf2 || !require.main.exports.tf2.itemSchema || !require.main.exports.tf2.lang) {
				prefixMsg(channel, sender.nick, "Required data is unavailable. Please try again later.");
				return;
			}
			
			switch(args[0]) {
				case 'tours':
					var tours = Object.keys(g_Tours);
					prefixMsg(channel, sender.nick, tours.length + " tours: " + tours.join(', '));
					break;
				
				case 'missions':
					if(args.length != 2) {
						require.main.exports.ircnotice(sender.nick, "Usage: mvm missions <tour>");
						break;
					}
					
					if(!g_Tours[args[1]]) {
						prefixMsg(channel, sender.nick, "Unknown tour \"" + args[1] + "\"");
						break;
					}
					
					var missions = Object.keys(g_Tours[args[1]].missions);
					prefixMsg(channel, sender.nick, g_Tours[args[1]].name + " has " + missions.length + " missions: " + missions.join(', '));
					break;
				
				case 'games':
				case 'servers':
					if(args.length != 3) {
						require.main.exports.ircnotice(sender.nick, "Usage: mvm " + args[0] + " <tour> <mission>");
						break;
					}
					
					if(!g_Tours[args[1]]) {
						prefixMsg(channel, sender.nick, "Unknown tour \"" + args[1] + "\"");
						break;
					}
					
					if(!g_Tours[args[1]].missions[args[2]]) {
						prefixMsg(channel, sender.nick, "Unknown mission \"" + args[2] + "\" in tour \"" + args[1] + "\"");
						break;
					}
					
					global.steam.getServerList("\\appid\\440\\white\\1\\name_match\\*mann up*\\map\\" + g_Tours[args[1]].missions[args[2]].missionMapName, 5000, function(servers) {
						var numServers = {};
						
						servers.forEach(function(server) {
							if(server.players === 0) {
								return;
							}
							
							if(!numServers[server.players]) {
								numServers[server.players] = 1;
							} else {
								numServers[server.players]++;
							}
						});
						
						var games = Object.keys(numServers).sort(function(a, b) { return b - a; }).map(function(num) {
							return numServers[num] + " server" + (numServers[num] == 1 ? '' : 's') + " [" + num + "/6]";
						});
						
						var totalServers = 0, totalPlayers = 0;
						Object.keys(numServers).forEach(function(numPlayers) {
							totalPlayers += (numPlayers * numServers[numPlayers]);
							totalServers += numServers[numPlayers];
						});
						
						prefixMsg(channel, sender.nick, totalServers + " servers, " + totalPlayers + " players on " + g_Tours[args[1]].missions[args[2]].name + ": " + games.join(', '));
					});
					break;
				
				case 'empty':
					global.steam.getServerList("\\appid\\440\\white\\1\\name_match\\*mann up*\\nor\\1\\hasplayers\\1", 5000, function(servers) {
						prefixMsg(channel, sender.nick, "There are " + servers.length + " empty Mann Up servers.");
					});
					
					break;
				
				default:
					require.main.exports.ircnotice(sender.nick, "Usage: mvm <tours|missions|games|empty>");
					break;
			}
		}
	};
};