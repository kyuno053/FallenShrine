const fs = require('fs');

let bot;
let log;
let config;
module.exports = {
    _instanciate:function (_bot,_config,_log) {
        config = _config;
        bot = _bot;
        log=_log;
        log.info("[START] Debug module OK");
        console.log("[START] Debug module OK");
    },
    process:function (user, userID, channelID, message) {
        let args = message.slice(1, message.length).split(' ');
        switch (args[0]) {
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: '```css\n#debug pong!\n```',
                });
                break;
            case 'siegeFile':
                bot.sendMessage({
                    to: channelID,
                    message: '```css\n#debug   UserFile exists :' + fs.existsSync(config.filePath.siege) + '\n```',
                });
                break;
        }
    }
};
