var IRC = require('internet-relay-chat');

var g_CurrentChamber = {};
var g_LoadedChamber = {};
var g_LastNick = {};
var g_RouletteInProgress = {};

module.exports = function(prefixMsg) {
	return {
		"triggers": ["roulette", "spin"],
		"description": "Play Russian roulette",
		"callback": function(sender, args, channel) {
			if(g_RouletteInProgress[channel]) {
				return;
			}
			
			if(g_LastNick[channel] == sender.nick) {
				prefixMsg(channel, sender.nick, "You can't go twice in a row!");
				return;
			}
			
			g_RouletteInProgress[channel] = true;
			g_LastNick[channel] = sender.nick;
			
			require.main.exports.irc.message(channel, IRC.colors.bold + sender.nick + IRC.colors.bold + " pulls the trigger...");
			setTimeout(function() {
				if(!g_LoadedChamber[channel]) {
					spinCylinder(channel);
				}
				
				var isDead = g_CurrentChamber[channel] == g_LoadedChamber[channel];
				
				if(args[0] == 'mega' && isDead) {
					require.main.exports.irc.kick(channel, sender.nick, "Chamber " + g_CurrentChamber[channel] + " of 6: " + IRC.colors.bold + "BANG!" + IRC.colors.bold);
				} else {
					require.main.exports.irc.message(channel, "Chamber " + g_CurrentChamber[channel] + " of 6: " + ((isDead) ? IRC.colors.bold + "BANG!" : IRC.colors.italic + "Click"));
				}
				
				if(isDead) {
					setTimeout(function() {
						spinCylinder(channel);
						g_LastNick[channel] = '';
						g_RouletteInProgress[channel] = false;
						require.main.exports.irc.action(channel, 'reloads');
					}, 1000);
				} else {
					g_CurrentChamber[channel]++;
					if(g_CurrentChamber[channel] == 6) {
						spinCylinder(channel);
						require.main.exports.irc.action(channel, 'spins the cylinder');
					}
					
					g_RouletteInProgress[channel] = false;
				}
			}, 1500);
		}
	};
};

function spinCylinder(channel) {
	g_CurrentChamber[channel] = 1;
	g_LoadedChamber[channel] = Math.floor(Math.random() * 6) + 1;
}