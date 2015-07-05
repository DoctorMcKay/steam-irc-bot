var SteamID = require('steamid');

module.exports = function(prefixMsg) {
	return {
		"triggers": ["steamid", "sid"],
		"description": "Gives information about a given SteamID",
		"callback": function(sender, args, channel) {
			if(!args[0]) {
				require.main.exports.irc.notice(sender.nick, "Usage: steamid <SteamID>");
				return;
			}
			
			var sid;
			try {
				sid = new SteamID(args[0]);
			} catch(e) {
				require.main.exports.irc.notice(sender.nick, e.toString());
				return;
			}
			
			var universe = sid.universe;
			var type = sid.type;
			var instance = sid.instance;
			var i;
			
			for(i in SteamID.Universe) {
				if(SteamID.Universe[i] == sid.universe) {
					universe = i.charAt(0).toUpperCase() + i.substring(1).toLowerCase() + " (" + sid.universe + ")";
					break;
				}
			}
			
			for(i in SteamID.Type) {
				if(SteamID.Type[i] == sid.type) {
					type = i.charAt(0).toUpperCase() + i.substring(1).toLowerCase();
					for(var j = 0; j < type.length; j++) {
						if(type.charAt(j) == '_') {
							type = type.substring(0, j) + type.charAt(j + 1).toUpperCase() + type.substring(j + 2);
						}
					}
					
					type += " (" + sid.type + ")";
					
					break;
				}
			}
			
			for(i in SteamID.Instance) {
				if(SteamID.Instance[i] == sid.instance) {
					instance = i.charAt(0).toUpperCase() + i.substring(1).toLowerCase() + " (" + sid.instance + ")";
				}
			}
			
			prefixMsg(channel, sender.nick, sid.getSteam3RenderedID() + (sid.type == SteamID.Type.INDIVIDUAL ? " / " + sid.getSteam2RenderedID() : '') + " / " + sid.getSteamID64() + " (Valid = " + (sid.isValid() ? "True" : "False") + ", Universe = " + universe + ", Type = " + type + ", Instance = " + instance + ", AccountID = " + sid.accountid + ")");
		}
	};
};