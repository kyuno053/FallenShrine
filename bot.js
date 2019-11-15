let Discord = require("discord.io");
const token = require("./config/auth").token;
const config = require("./config/general");
let bot = new Discord.Client({
    token: token,
    autorun: true
});

bot.on('ready', function () {
    console.log("Bot ready!");
});
bot.on('message', function (user, userID, channelID, message, event) {

    let messageOperator = message.slice(0, 1);

    switch (messageOperator) {

        case config.operator.debug:
            debugProcess(user, userID, channelID, message);
            break;
        case config.operator.command:

            break;
    }


});


bot.connect();


//functions
function debugProcess(user, userID, channelID, message) {

    let args = message.slice(1,message.length ).split(' ');
    switch (args[0]) {
        case "ping":
            bot.sendMessage({
                to: channelID,
                message: "```css\n#debug pong!\n```"
            });
            break;
    }


}


