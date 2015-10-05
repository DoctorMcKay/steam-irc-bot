// Credit to http://mcpubba.net/techgen.html for this amazing code
var start = [
	'The first thing we need to do is ',
	'To fix your problem, we have to ',
	'The hackers are getting in! Quickly, ',
	'To get in to the government database we\'re going to ',
	'Quickly! We have to ',
	'We can get rid of the virus, don\'t worry. First we have to '
];

var verb = [
	'reroute',
	'splice',
	'compile',
	'reprocess',
	'log',
	'port',
	'decrypt',
	'encrypt',
	'recode',
	'refactor',
	'import',
	'export',
	'modify',
	'uninstall',
	'install',
	'upload',
	'download',
	'open',
	'decode',
	'push',
	'recompile',
	'decompile',
	'write a GUI to track',
	'trace',
	'troubleshoot'
];

var noun = [
	' the VGA cable',
	' the USB',
	' the browser',
	' the interface',
	' the Internet',
	' the IP address',
	' the source code',
	' the hard drive',
	' the RAM',
	' the CPU',
	' the motherboard',
	' the monitor',
	' the shortcut',
	' the LAN',
	' the Wi-Fi',
	' the CAT5',
	' the Bluetooth',
	' the program',
	' the encryption',
	' the compiler',
	' the IDE',
	' Linux',
	' Microsoft Word',
	' the Google',
	' the traceroute',
	' the stack',
	' C++',
	' Java',
	' JavaScript',
	' C',
	' C#',
	' Python',
	' the programming language',
	' the SATA cable',
	' the subnet mask',
	' the Ethernet',
	' the Ethernet adapter',
	' the GPU',
	' the keyboard',
	' Internet Explorer',
	' Ubuntu',
	' the command prompt',
	' the command line',
	' HTTPS',
	' FTP',
	' SSH',
	' Visual Basic'
];

var preposition = [
	' through',
	' into',
	' with',
	' on'
];

function chooseOne(list){
	return list[Math.floor(Math.random() * list.length)];
}

function doList(){
	return chooseOne(start) + chooseOne(verb) + chooseOne(noun) + chooseOne(preposition) + chooseOne(noun) + '.';
}

module.exports = function(prefixMsg) {
	return {
		"triggers": ["csi"],
		"description": "Solve a crime",
		"callback": function(sender, args, channel) {
			prefixMsg(channel, sender.nick, doList());
		}
	};
};