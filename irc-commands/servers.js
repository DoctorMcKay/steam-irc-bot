const MAX_SERVERS = 20000;

module.exports = function(prefixMsg) {
	return {
		"triggers": ["servers", "numservers"],
		"description": "Get the number of servers matching a filter",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				prefixMsg(channel, sender.nick, "Usage: numservers <filter>");
				return;
			}

			require.main.exports.steam.getServerList(args.raw, MAX_SERVERS, function(servers) {
				var players = 0;
				servers.forEach(function(server) {
					players += server.players;
				});

				if(servers.length === 0) {
					prefixMsg(channel, sender.nick, "No servers");
				} else if(servers.length > 15) {
					prefixMsg(channel, sender.nick, (servers.length == MAX_SERVERS ? '>' : '') + servers.length.format() + " servers (" + (servers.length == MAX_SERVERS ? '>' : '') + players.format() + " player" + (players == 1 ? '' : 's') + ')');
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