module.exports = function(prefixMsg) {
	return {
		"triggers": ["warstats", "war"],
		"description": "Get Spy vs. Engi War stats",
		"callback": function(sender, args, channel) {
			require.main.exports.tf2.requestSpyVsEngiWarStats();
			require.main.exports.tf2.once('spyVsEngiWarStats', function(spyScore, engiScore) {
				prefixMsg(channel, sender.nick, "Spy: " + spyScore + " - Engi: " + engiScore);
			});
		}
	};
};