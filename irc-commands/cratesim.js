module.exports = function(prefixMsg) {
	return {
		"triggers": ["cratesim", "crate", "crates"],
		"description": "Simulate opening crates until you unbox an unusual",
		"callback": function(sender, args, channel) {
			if(args[0] == 'help') {
				require.main.exports.irc.notice(sender.nick, "Usage: cratesim [percent chance] [key price]");
				return;
			}
			
			if(args[0] && (isNaN(parseFloat(args[0])) || args[0] < 1 || args[0] > 100)) {
				require.main.exports.irc.notice(sender.nick, "Usage: cratesim [percent chance] [key price]");
				return;
			}
			
			if(args[1] && (isNaN(parseFloat(args[1])) || args[1] < 0.01)) {
				require.main.exports.irc.notice(sender.nick, "Usage: cratesim [percent chance] [key price]");
				return;
			}
			
			var chance = args[0] ? (args[0] / 100) : 0.01;
			var keyPrice = args[1] || 2.49;
			
			var cratesOpened = 0;
			
			do {
				cratesOpened++;
			} while(Math.random() > chance);
			
			prefixMsg(channel, sender.nick, cratesOpened + " crates opened until we got an unusual. $" + (cratesOpened * keyPrice).toFixed(2) + " spent");
		}
	};
};