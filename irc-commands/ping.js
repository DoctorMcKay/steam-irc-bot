module.exports = function(prefixMsg) {
	return {
		"triggers": ["ping"],
		"description": "Sends back pong",
		"callback": function(sender, args, channel) {
			prefixMsg(channel, sender.nick, "Pong!");
		}
	};
};