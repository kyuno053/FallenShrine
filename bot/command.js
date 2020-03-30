let bot;
let log;
let config;
let global;
let servId;
let data;
/**
 * Sub-modules
 *
 */
const gs = require('./gs');

module.exports = {
    _instanciate:function (_bot,_log,_config,_global,_data) {
        bot =_bot;
        log =_log;
        config = _config;
        global = _global;
        data = _data;
        gs._instanciate(_bot,_log,_config,_global,_data);
        log.info("[START] Command module OK");
        console.log("[START] Command module OK");
    },
    process:function (user, userID, channelID, message) {
        let args = message.slice(1, message.length).split(' ');
        servId = bot.channels[channelID].guild_id;
        if(global.hasUserRole(userID,servId)){
            switch (args[0]) {

                case 'gs':
                    if (channelID !== config.channels.gs) {
                        bot.sendMessage({
                            to: channelID,
                            message: '```diff\n- Wrong channel\nPlease go on the dedicated channel!```',
                        });
                    } else {
                        gs.management(user, userID, config.channels.gs, args);
                    }
                    break;

                case 'site':
                    bot.sendMessage({
                        to: channelID,
                        message: 'https://tenor.com/view/im-working-on-it-im-trying-work-in-progress-john-krasinski-jack-ryan-gif-15585568',
                    });
                    break;
            }
        }else{
            bot.sendMessage({
                to: channelID,
                message: '```diff\n- Unauthorized request!```',
            });
        }
    }
};
