var IRC = require('internet-relay-chat');

module.exports = function(prefixMsg) {
	return {
		"triggers": ["warstats", "war"],
		"description": "Get War stats",
		"callback": function(sender, args, channel) {
			require.main.exports.tf2.requestWarStats(function(scores) {
				scores[0] = parseInt(scores[0], 10);
				scores[1] = parseInt(scores[1], 10);

				var total = scores[0] + scores[1];
				prefixMsg(channel, sender.nick, IRC.colors.bold + (scores[0] > scores[1] ? "Heavy" : "Pyro") + IRC.colors.bold + " is winning with " +
					IRC.colors.bold + Math.round((Math.max(scores[0], scores[1]) / total) * 100) + "%" + IRC.colors.bold +
					" of the vote and " + IRC.colors.bold + Math.max(scores[0], scores[1]).format() + IRC.colors.bold + " points. " +
					(scores[0] > scores[1] ? "Pyro" : "Heavy") + " is trailing with only " + Math.min(scores[0], scores[1]).format() + " points.");
			});
		}
	};
};