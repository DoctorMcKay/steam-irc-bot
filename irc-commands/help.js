module.exports = function(prefixMsg) {
	return {
		"triggers": ["help"],
		"description": "Get list of available IRC commands",
		"callback": function(sender, args) {

			var commands = require.main.exports.ircCommands;
			
			if(args.length > 0 && commands[args[0].toLowerCase()]) {
				var command = commands[args[0].toLowerCase()];
				
				require.main.exports.irc.notice(sender.nick, command.triggers[0] + (command.triggers.length > 1 ? " (" + command.triggers.slice(1).join(', ') + ")" : '') + " - " + command.description);
				return;
			}
			
			var list = [];
			var i, j;
			for(i in commands) {
				if(i != commands[i].triggers[0]) {
					// Alias
					continue;
				}
				
				list.push(i);
			}
			
			list.sort();
			
			require.main.exports.irc.notice(sender.nick, "Commands: " + list.join(', '));
		}
	};
};