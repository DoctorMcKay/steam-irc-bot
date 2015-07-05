module.exports = function(prefixMsg) {
	return {
		"triggers": ["8ball"],
		"description": "Answers a question for you",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				prefixMsg(channel, sender.nick, "You must ask a question!");
				return;
			}
			
			var responses = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "As I see it yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
			var index = Math.floor(Math.random() * responses.length);
			prefixMsg(channel, sender.nick, responses[index]);
		}
	};
};