var IRC = require('internet-relay-chat');

module.exports = function(prefixMsg) {
	return {
		"triggers": ["randomapp"],
		"description": "Feeling lucky? Get a random game or software from Steam",
		"callback": function(sender, args, channel) {
			var apps = Object.keys(require.main.exports.steamAppNames);
			var appid = apps[Math.floor(Math.random() * apps.length)];
			prefixMsg(channel, sender.nick, "Feeling lucky? You might like to try " + IRC.colors.bold + require.main.exports.steamAppName(appid) + IRC.colors.bold + " - https://steam.pm/app/" + appid);
		}
	};
};