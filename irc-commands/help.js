module.exports = function(prefixMsg) {
	return {
		"triggers": ["help"],
		"description": "Get list of available IRC commands",
		"callback": function(sender, args) {
			var lines = [];
			var i, j;

			var commands = require.main.exports.ircCommands;
			
			for(i in commands) {
				if(i != commands[i].triggers[0]) {
					// Alias
					continue;
				}

				lines.push(i + (commands[i].triggers.length > 1 ? " (" + commands[i].triggers.slice(1).join(', ') + ") " : '') + " - " + commands[i].description);
			}
			
			lines.sort();
			for(i = 0; i < lines.length; i++) {
				require.main.exports.irc.notice(sender.nick, lines[i]);
			}
		}
	};
};