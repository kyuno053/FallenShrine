let bot;
let log;
let config;
let global;
let servId;
let data;
let youtubeStream;
/**
 * Sub-modules
 *
 */
const gs = require('./gs');
const music = require('./music');

module.exports = {
    _instanciate:function (_bot,_log,_config,_global,_data,_stream) {
        bot =_bot;
        log =_log;
        config = _config;
        global = _global;
        data = _data;
        youtubeStream =_stream;
        gs._instanciate(_bot,_log,_config,_global,_data);
        music._instanciate(_bot,_log,_config,_global,_stream);
        log.info("[START] Command module OK");
        console.log("[START] Command module OK");
    },
    process:function (message) {
        //console.log(message.member.roles.cache);
        let args = message.content.slice(1, message.length).split(' ');
        servId = message.guild.id;
        if(global.hasUserRole(message.member.roles.cache)){
            switch (args[0]) {

                case 'gs':
                    if (message.channel.id !== config.channels.gs) {
                       message.channel.send('```diff\n- Wrong channel\nPlease go on the dedicated channel!```');
                    } else {
                        gs.management(message, args);
                    }
                    break;
                case 'music':
                    if (message.channel.id !== config.channels.music) {
                        message.channel.send('```diff\n- Wrong channel\nPlease go on the dedicated channel!```');
                    } else {
                        music.management(message,args);
                    }
                    break;

                case 'site':
                    message.channel.send( 'https://tenor.com/view/im-working-on-it-im-trying-work-in-progress-john-krasinski-jack-ryan-gif-15585568');
                    break;
            }
        }else{
           message.channel.send( '```diff\n- Unauthorized request!```');
        }
    }
};
