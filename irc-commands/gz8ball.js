module.exports = function(prefixMsg) {
	return {
		"triggers": ["gz8ball"],
		"description": "Answers a question fo' you",
		"callback": function(sender, args, channel) {
			if(args.length === 0) {
				prefixMsg(channel, sender.nick, "You must ask a question!");
				return;
			}
			
			var responses = ["It be certain", "It be decidedly so", "Without a thugged-out doubt", "Yes yes y'all, definitely", "Yo ass may rely on dat shit", "As I peep it yes", "Most likely", "Outlook good", "Yes", "signs point ta yes", "Reply hazy try again n' again n' again n' again n' again n' again n' again", "Ask again n' again n' again later", "Better not rap now", "Cannot predict now", "Concentrate n' ask again n' again n' again n' again n' again n' again n' again", "Don't count on dat shit", "My fuckin reply is no", "My fuckin sources say no", "Outlook not so good", "Straight-up doubtful"];
			var index = Math.floor(Math.random() * responses.length);
			prefixMsg(channel, sender.nick, responses[index]);
		}
	};
};