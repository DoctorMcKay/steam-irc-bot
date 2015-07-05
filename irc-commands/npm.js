var request = require('request');

const TIMES = [
	{
		"seconds": (60 * 60 * 24 * 365),
		"unit": "year"
	},
	{
		"seconds": (60 * 60 * 24 * 30),
		"unit": "month"
	},
	{
		"seconds": (60 * 60 * 24),
		"unit": "day"
	},
	{
		"seconds": (60 * 60),
		"unit": "hour"
	},
	{
		"seconds": 60,
		"unit": "minute"
	},
	{
		"seconds": 1,
		"unit": "second"
	}
];

module.exports = function(prefixMsg) {
	return {
		"triggers": ["npm"],
		"description": "Gets info about an npm package",
		"callback": function(sender, args, channel) {
			if(args.length != 1) {
				require.main.exports.irc.notice(sender.nick, "Usage: npm <package name>");
				return;
			}
			
			request({
				"uri": "https://registry.npmjs.org/" + args[0],
				"json": true
			}, function(err, response, body) {
				if(err || response.statusCode != 200) {
					prefixMsg(channel, sender.nick, "Error: " + (err ? err.message : (response.statusCode == 404 ? "Package not found" : "HTTP error " + response.statusCode)));
					return;
				}
				
				if(!body.name) {
					prefixMsg(channel, sender.nick, "Error: Malformed response");
					return;
				}
				
				var version = body['dist-tags'] && body['dist-tags'].latest;
				var output = body.name + ' (' + ('v' + version || 'unknown version') + ')';
				
				if(body.time && body.time[version]) {
					output += ' - ';
					
					var timeAgo = Math.floor((Date.now() - new Date(body.time[version]).getTime()) / 1000);
					
					if(body.versions && body.versions[version] && body.versions[version]._npmUser) {
						output += body.versions[version]._npmUser.name + ' published ';
					}
					
					var time;
					for(var i = 0; i < TIMES.length; i++) {
						time = TIMES[i];
						
						if(timeAgo >= time.seconds) {
							var value = Math.floor(timeAgo / time.seconds);
							output += value + ' ' + time.unit + (value != 1 ? 's' : '');
							break;
						}
					}
					
					output += ' ago';
				}
				
				if(body.versions && body.versions[version]) {
					var dependencies = 0;
					if(body.versions[version].dependencies) {
						dependencies = Object.keys(body.versions[version].dependencies).length;
					}
					
					output += ' - ' + dependencies + ' ' + (dependencies == 1 ? 'dependency' : 'dependencies');
				}
				
				prefixMsg(channel, sender.nick, output);
				
				output = 'https://www.npmjs.com/package/' + body.name;
				if(body.homepage) {
					output += ' - ' + body.homepage;
				}
				
				prefixMsg(channel, sender.nick, output);
			});
		}
	};
};