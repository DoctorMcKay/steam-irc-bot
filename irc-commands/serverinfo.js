var SourceQuery = require('sourcequery');

module.exports = function(prefixMsg) {
	return {
		"triggers": ["serverinfo", "serverdata", "hl2"],
		"description": "Gets the public info of a game server by IP",
		"callback": function(sender, args, channel) {
			if(args.length != 1) {
				prefixMsg(channel, sender.nick, "Usage: serverinfo <ip:port>");
				return;
			}
			
			var sq = new SourceQuery(5000);
			var address = args[0].split(':');
			sq.open(address[0], address[1] || 27015);
			sq.getInfo(function(err, info) {
				if(err) {
					prefixMsg(channel, sender.nick, err);
					return;
				}
				
				prefixMsg(channel, sender.nick, info.name + " (" + info.game + "): " + info.players + "/" + info.maxplayers + " - " + info.map);
			});
		}
	};
};