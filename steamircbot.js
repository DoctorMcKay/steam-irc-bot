// Include modules
var Steam = require('steam');
var SteamStuff = require('steamstuff');
var TeamFortress2 = require('tf2');
var IRC = require('internet-relay-chat');
var request = require('request');
var fs = require('fs');

// Include config
var config = require('./config.json');

// Global vars
var g_SteamInit = false;
var g_TF2Version;
var g_TF2SchemaVersion;
var g_PicsChangenumber = 1;
var g_AppNames = {};
var g_RealAppNames = {};
var g_IRCCommands = {};

// Initialize
var client = new Steam.SteamClient();
SteamStuff(Steam, client);
var tf2 = new TeamFortress2(client);
var irc = new IRC(config.irc);

// Set up IRC
irc.connect();

irc.on('connect', function() {
	console.log("Connected to IRC");
});

irc.on('registered', function() {
	console.log("Registered with IRC, joining channels");
	config.channels.forEach(function(channel) {
		irc.join(channel);
	});

	// Log into Steam if not logged in already
	if(!g_SteamInit) {
		g_SteamInit = true;
		steamLogOn();
	}
});

irc.on('message', function(sender, channel, message) {
	var match = message.match(/^\.[a-zA-Z0-9]+( |$)/);
	if(match) {
		// This is a command
		var parts = message.substring(1).trim().split(' ');
		var command = parts[0].toLowerCase();
		var args = parts.slice(1);

		if(!g_IRCCommands[command]) {
			// Not a command that we recognize
			return;
		}

		if(!client.loggedOn || !tf2.haveGCSession) {
			irc.notice(sender.nick, "Currently logged off of Steam or TF2 GC, please try again later.");
			return;
		}

		// Parse arguments
		var rawArgs = args.join(' ');
		args = [];

		var buf = '';
		var quoted = false, escaped = false, c;

		for(var i = 0; i < rawArgs.length; i++) {
			c = rawArgs.charAt(i);

			if(c == ' ' && !quoted) {
				args.push(buf);
				buf = '';
			} else if(c == '"' && !escaped) {
				quoted = !quoted;
			} else if(c == '\\') {
				escaped = true;
			} else {
				escaped = false;
				buf += c;
			}
		}

		if (buf.length > 0) {
			args.push(buf);
		}

		args.raw = rawArgs;

		g_IRCCommands[command].callback(sender, args, channel);
	}
});

function ircAnnounce(message, action) {
	Object.keys(irc.channels).forEach(function(channel) {
		if(action) {
			irc.action(channel, message);
		} else {
			irc.message(channel, message);
		}
	});
}

function ircPrefixMsg(target, prefix, msg) {
	irc.message(target, IRC.colors.bold + prefix + ": " + IRC.colors.reset + msg);
}

// Load IRC commands
fs.readdir(__dirname + '/irc-commands', function(err, files) {
	if(err) {
		console.log("Couldn't read irc-commands: " + err);
		return;
	}

	files.forEach(function(file) {
		if(file.match(/\.js$/)) {
			var command = require(__dirname + '/irc-commands/' + file)(ircPrefixMsg);
			command.triggers.forEach(function(trigger) {
				g_IRCCommands[trigger] = command;
			});

			console.log("Loaded IRC command " + command.triggers[0]);
		}
	})
});

// Set up Steam
function steamLogOn() {
	client.logOn({
		"accountName": config.steam.username,
		"password": config.steam.password
	});
}

client.on('loggedOn', function() {
	ircAnnounce("now connected to Steam!", true);
	client.setPersonaState(Steam.EPersonaState.Online);
	client.gamesPlayed([440]);

	if(g_PicsChangenumber == 1) {
		console.log("Steam now logged in, requesting full PICS update for app names...");
		client.picsGetChangesSince(1, true, false, function (result) {
			g_PicsChangenumber = result.currentChangeNumber;
			var apps = result.appChanges.map(function (app) {
				return app.appid;
			});

			setInterval(function() {
				client.picsGetChangesSince(g_PicsChangenumber, true, false, function(picsResult) {
					if(picsResult.currentChangeNumber == g_PicsChangenumber) {
						return; // Nothing changed
					}

					var picsApps = picsResult.appChanges.map(function(app) {
						return app.appid;
					});

					picsApps.forEach(function(app) {
						if(config.importantApps.indexOf(app) != -1) {
							ircAnnounce("Important app change: " + IRC.colors.bold + steamAppName(app) + IRC.colors.reset + " - https://steamdb.info/app/" + app + "/history/");
						}
					});

					client.picsGetProductInfo(apps, [], steamDigestAppinfo);
				});
			}, 5000);

			console.log("Got list of " + apps.length + " appids for changenumber " + g_PicsChangenumber + ", requesting info");
			client.picsGetProductInfo(apps, [], steamDigestAppinfo);
		});
	}
});

function steamAppName(app) {
	return g_AppNames[app] || "Unknown App " + app;
}

function steamFindAppByName(name, allowFake) {
	var regex = new RegExp(name, 'i');

	var apps = allowFake ? g_AppNames : g_RealAppNames;
	for(var appid in apps) {
		if(!apps.hasOwnProperty(appid)) {
			continue;
		}

		if(apps[appid].match(regex)) {
			return parseInt(appid, 10);
		}
	}

	return null;
}

function steamDigestAppinfo(info) {
	for (var appid in info.apps) {
		if(!info.apps.hasOwnProperty(appid)) {
			continue;
		}

		if (info.apps[appid].data.appinfo && info.apps[appid].data.appinfo.common && info.apps[appid].data.appinfo.common.name) {
			g_AppNames[appid] = info.apps[appid].data.appinfo.common.name;

			if (['config', 'dlc', 'hardware', 'media'].indexOf((info.apps[appid].data.appinfo.common.type || '').toLowerCase()) == -1) {
				g_RealAppNames[appid] = info.apps[appid].data.appinfo.common.name;
			}
		}
	}
}

client.on('loggedOff', function() {
	ircAnnounce("now disconnected from Steam: ServiceUnavailable");
});

client.on('error', function(e) {
	if(e.eresult == Steam.EResult.AccountLogonDenied) {
		return; // SteamStuff handles this
	}

	var result = e.eresult;
	for(var i in Steam.EResult) {
		if(Steam.EResult[i] == e.eresult) {
			result = i;
			break;
		}
	}

	ircAnnounce("now disconnected from Steam: " + result);
});

// Set up TF2
tf2.on('connectedToGC', function(version) {
	if(g_TF2Version && g_TF2Version != version) {
		ircAnnounce("Now connected to TF2 GC (version = " + version + ", old version = " + g_TF2Version + ")");
	} else {
		ircAnnounce("Now connected to TF2 GC (version = " + version + ")");
	}

	g_TF2Version = version;
	tf2SetLang();
});

tf2.on('disconnectedFromGC', function(reason) {
	var result = reason;
	for(var i in TeamFortress2.GCGoodbyeReason) {
		if(TeamFortress2.GCGoodbyeReason[i] == reason) {
			result = i;
			break;
		}
	}

	ircAnnounce("Now disconnected from TF2 GC: " + result);
});

tf2.on('itemSchema', function(version, url) {
	if(!g_TF2SchemaVersion) {
		g_TF2SchemaVersion = version;
		return;
	}

	ircAnnounce("TF2 item schema updated (version = " + version + ", old version = " + g_TF2SchemaVersion + "): " + url);
	g_TF2SchemaVersion = version;
	tf2SetLang();
});

tf2.on('systemMessage', function(msg) {
	ircAnnounce(IRC.colors.bold + "TF2 system message: " + IRC.colors.reset + msg);
});

tf2.on('displayNotification', function(title, body) {
	ircAnnounce(IRC.colors.bold + "TF2 client notification: " + IRC.colors.reset + title);
	ircAnnounce(body);
});

tf2.on('itemBroadcast', function(message, username, wasDestruction, defindex) {
	if(!message) {
		return;
	}

	ircAnnounce(IRC.colors.bold + "TF2 item broadcast: " + IRC.colors.reset + message);
});

function tf2SetLang() {
	if(config.tf2LangUrl) {
		request(config.tf2LangUrl, function(err, response, body) {
			if(err || response.statusCode != 200) {
				console.log("Cannot get lang: " + (err ? err.message : "HTTP error " + response.statusCode));
				return;
			}

			tf2.setLang(body);
		});
	}
}

// Do bad things
// This is monstrous but since node doesn't have toLocaleString... ¯\_(?)_/¯
Number.prototype.format = function() {
	return this.toString().split('').reverse().join('').replace(/(\d{3})/g, '$1,').split('').reverse().join('').replace(/^,/, '');
};

// Exports
exports.steam = client;
exports.irc = irc;
exports.tf2 = tf2;
exports.ircCommands = g_IRCCommands;
exports.steamAppNames = g_AppNames;
exports.steamFindAppByName = steamFindAppByName;
exports.steamAppName = steamAppName;
