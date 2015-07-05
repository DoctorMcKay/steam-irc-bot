module.exports = function(prefixMsg) {
	return {
		"triggers": ["servers", "numservers"],
		"description": "Get the number of servers matching a filter",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				prefixMsg(channel, sender.nick, "Usage: numservers <filter>");
				return;
			}

			require.main.exports.steam.getServerList(args.raw, 5000, function(servers) {
				var players = 0;
				servers.forEach(function(server) {
					players += server.players;
				});

				if(servers.length === 0) {
					prefixMsg(channel, sender.nick, "No servers");
				} else if(servers.length > 15) {
					prefixMsg(channel, sender.nick, (servers.length == 5000 ? '>' : '') + servers.length.format() + " servers (" + (servers.length == 5000 ? '>' : '') + players.format() + " player" + (players == 1 ? '' : 's') + ')');
				} else {
					servers = servers.map(function(server) {
						return server.addr + ' (' + server.players + '/' + server.maxPlayers + ')';
					});

					prefixMsg(channel, sender.nick, servers.length + " server" + (servers.length == 1 ? '' : 's') + " (" + players.format() + " player" + (players == 1 ? '' : 's') + "): " + servers.join(', '));
				}
			});
		}
	};
};