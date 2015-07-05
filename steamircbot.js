// Include modules
var Steam = require('steam');
var SteamStuff = require('steamstuff');
var TeamFortress2 = require('tf2');
var IRC = require('internet-relay-chat');
var request = require('request');

// Include config
var config = require('./config.json');

// Global vars
var g_SteamInit = false;
var g_TF2Version;
var g_TF2SchemaVersion;

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

function ircAnnounce(message, action) {
	Object.keys(irc.channels).forEach(function(channel) {
		if(action) {
			irc.action(channel, message);
		} else {
			irc.message(channel, message);
		}
	});
}

// Set up Steam
function steamLogOn() {
	client.logOn({
		"accountName": config.steam.username,
		"password": config.steam.password
	});
}

client.on('loggedOn', function() {
	ircAnnounce("now connected to Steam!", true);
	client.gamesPlayed([440]);
});

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
