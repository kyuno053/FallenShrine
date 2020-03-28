/**
 * Dependencies
 */
const Discord = require('discord.io');
const log = require('simple-node-logger').createSimpleFileLogger('./bot.log');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
/**
 * Modules
 */
const global = require('./bot/global');
const settings = require('./bot/settings');
const command = require('./bot/command');
const debug = require('./bot/debug');

/**
 * Config
 */
const token = require('./config/auth.json').token;
const _config = require('./config/config.json');
/**
 * Variables
 */
let messageQueue = [];
let servId = null;
let bot = new Discord.Client({
    token: token,
    autorun: true,
});
let srv = express();
let corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

/**
 * BOT
 */

bot.on('ready', function () {
    global._instanciate(bot,_config,log);
    settings._instanciate(bot,_config,log,global);
    command._instanciate(bot,log,_config,global);
    debug._instanciate(bot,_config,log);
    log.info('[START] Bot ready! - connected: ' + bot.connected);
    console.log('[START] Bot ready! - connected: ' + bot.connected);

});
bot.setPresence({
    game: {
        name: _config.version,
        type: 1
    },
});
bot.on('disconnect', function (erMsg, code) {
    log.info('----- Bot disconnected from Discord with code: ', code, ' for reason:', erMsg, '-----');
});

bot.on('message', function(user, userID, channelID, message, event) {

    if (servId == null) {
        servId = bot.channels[channelID].guild_id;
    }
    let messageOperator = message.slice(0, 1);
    let keys = Object.keys(_config.operator);
    let isCommand = false;
    for (let k of keys){
        if(_config.operator[k] == messageOperator){
            isCommand = true;
        }
    }
    if (isCommand == true){
        const data = {
            'user': user,
            'userID': userID,
            'channelID': channelID,
            'message': message,
            'event': event,
        };
        messageQueue.push(data);
    }
});

bot.on('guildMemberRemove', function(user) {
    log.info('[WARN] member remove :' + user.toString());
    let userData = JSON.parse(fs.readFileSync(_config.filePath.siege));
    let index;
    for (const users of userData) {
        if (user.id === users.userId) {
            index = userData.indexOf(users);
        }
    }
    userData.users.splice(index, 1);
    fs.writeFileSync(_config.filePath.siege,JSON.stringify(userData));
});
bot.on('guildMemberUpdate',function (a,b) {
    let userData = JSON.parse(fs.readFileSync(_config.filePath.siege));
    if(userData.filter(item=>item.id != b.id) === undefined){
        if(global.hasUserRole(b.id,servId)){
            userData.push({
                userId:  b.id,
                nat5def: [],
                nat4def: [],
                lock: {'nat5': false, 'nat4': false},

            });
        }
    }

    fs.writeFileSync(_config.filePath.siege,JSON.stringify(userData));
});

/**
 * Web Services
 */

srv.use(cors(corsOptions));
srv.listen(3250, function() {
    console.log('[INFO] data service work on port 3250');
    log.info('[INFO] data service work on port 3250');
});

srv.route('/allDefs').get((req, res) => {
    res.send(fs.readFileSync(_config.filePath.siege));
    res.end();
});
srv.route('/allMobs').get((req, res) => {
    res.send(fs.readFileSync(_config.filePath.allMobs));
    res.end();
});


/**
 * Poller
 *
 *
 * */
//process message queue
setInterval(function() {
    if (messageQueue.length !== 0) {
        for (let i = messageQueue.length - 1; i >= 0; i--) {
            let data = messageQueue[i];
            log.info('[WARN] command: '+data.message+' - user: '+data.user);
            let messageOperator = data.message.slice(0, 1);
            switch (messageOperator) {
                case _config.operator.setting:
                    settings.process(data.user, data.userID, data.channelID, data.message);
                    break;
                /**
                 case _config.operator.debug:
                 debugProcess(data.user, data.userID, data.channelID, data.message);
                 break;
                 */
                 case _config.operator.command:
                 command.process(data.user, data.userID, data.channelID, data.message);
                 break;

            }
            messageQueue.splice(i, 1);
        }
    }
}, 500);

// save config
setInterval(function () {
    fs.writeFileSync("./config/config.json",JSON.stringify(_config));
},30000);

/**
 * Poll to test connection
 * if is disconnected , try to reconnect
 */

setInterval(function() {
    if (bot.connected === false) {
        log.info('[DEBUG] Disconnected!');
        bot.disconnect();
        setTimeout(function() {
            bot.connect();
            if (bot.connected === true) {
                log.info('[DEBUG]Reconnected !');
            }
        }, 1000);
    }
}, 6000);
