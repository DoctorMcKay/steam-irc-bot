module.exports = function(prefixMsg) {
	return {
		"triggers": ["calc", "calculate"],
		"description": "Calculate an expression",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				var keywords = Object.getOwnPropertyNames(Math).filter(function(keyword) {
					return keyword != 'toSource' && keyword.indexOf('_') == -1;
				});
				
				require.main.exports.irc.notice(sender.nick, "You must specify an expression to compute. Available keywords: " + keywords.join(', '));
				return;
			}
			
			var expr = args.raw;
			var match;
			if((match = expr.match(/[^a-zA-Z0-9\s\+\-\*\/(\),\.]/))) {
				prefixMsg(channel, sender.nick, "Invalid character " + match[0]);
				return;
			}
			
			if(expr.match(/[a-zA-Z]\./) || expr.match(/\.[a-zA-Z]/)) {
				prefixMsg(channel, sender.nick, "Invalid expression");
				return;
			}

			if((match = expr.match(/(\+\+|\-\-)/))) {
				prefixMsg(channel, sender.nick, "Invalid operator " + match[0]);
				return;
			}

			while((match = expr.match(/(^|\s|\(|\)|,|\+|\-|\*|\/)([a-zA-Z][a-zA-Z0-9]*)($|\s|\)|,|\+|\-|\*|\/)/))) {
				expr = expr.replace(match[0], match[0].replace(match[2], "Math." + match[2].toUpperCase()));
			}

			while((match = expr.match(/(^|\s|\(|\)|,|\+|\-|\*|\/)([a-zA-Z][a-zA-Z0-9]*)\(/))) {
				expr = expr.replace(match[0], match[0].replace(match[2], "Math." + match[2].toLowerCase()));
			}

			try {
				var result = eval(expr);
				if(isNaN(result)) {
					prefixMsg(channel, sender.nick, "Invalid expression");
				} else {
					prefixMsg(channel, sender.nick, result);
				}
			} catch(e) {
				if((match = e.toString().match(/has no method '([a-z]+)'/))) {
					prefixMsg(channel, sender.nick, "Unknown function " + match[1]);
				} else {
					prefixMsg(channel, sender.nick, "Invalid expression");
				}
			}
		}
	};
};