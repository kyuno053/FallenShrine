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
            commandProcess(user, userID, channelID, message);
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

function commandProcess(user, userID, channelID, message) {

    let args = message.slice(1,message.length ).split(' ');

    switch (args[0]) {

        case "gs":
            gsManagement(user, userID, channelID,args);
        break;
    }


}

function gsManagement(user, userID, channelID,args){

    if(args.length > 1){

        let mobs = null;
        switch (args[1]) {

            case "addNat5Def":
               mobs = args[2].split('/');
               if (mobs.length > 3){
                   bot.sendMessage({
                       to:channelID,
                       message: "```css\n#gs your team is too long!\n```"
                   });
               }else{
                   bot.sendMessage({
                       to:channelID,
                       message: "```css\n#gs your team\n```\n```diff\n- "+mobs[0]+" "+mobs[1]+" "+mobs[2]+"\n```"
                   });
               }

                break;
            case "addNat4Def":
                mobs= args[2].split('/');
                if (mobs.length > 3){
                    bot.sendMessage({
                        to:channelID,
                        message: "```css\n#gs your team is too long!\n```"
                    });
                }else{
                    bot.sendMessage({
                        to:channelID,
                        message: "```css\n#gs your team\n```\n```fix\n- "+mobs[0]+" "+mobs[1]+" "+mobs[2]+"\n```"
                    });
                }

                break;

        }
    }else{
        bot.sendMessage({
            to:channelID,
            message: "```css\n#gs Missing parameter(s)\n```"
        });
    }
}


