/**
 * Dependencies
 */
const Discord = require('discord.js');
const log = require('simple-node-logger').createSimpleFileLogger('./bot.log');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const youtubeStream = require('ytdl-core');
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
let data = {'siege': []};

let servId = null;
let bot = new Discord.Client();
let srv = express();
let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

/**
 * BOT
 */
bot.login(token);

bot.on('ready', function() {
  if (fs.readFileSync(_config.filePath.siege)) {
    data.siege = JSON.parse(fs.readFileSync(_config.filePath.siege));
  }
  global._instanciate(bot, _config, log);
  settings._instanciate(bot, _config, log, global, data);
  command._instanciate(bot, log, _config, global, data,youtubeStream);
  debug._instanciate(bot, _config, log, data,global);
  log.info('[START] Bot ready! - connected: ' + bot.user.tag);
  console.log('[START] Bot ready! - connected: ' +bot.user.tag );
  bot.user.setPresence({activity:{name:_config.version},status:'online'});
});


bot.on('error', function(err) {
  log.info('----- Bot disconnected from Discord for reason:', err, '-----');
});

bot.on('message', function(msg) {

  if (servId == null) {
    servId = msg.guild.id;
  }

  let message_processed = msg.content.replace(/\r?\n|\r/g,'');
  let messageOperator = message_processed.slice(0, 1);
  let keys = Object.keys(_config.operator);
  let isCommand = false;
  for (let k of keys) {
    if (_config.operator[k] == messageOperator) {
      isCommand = true;
    }
  }
  if (isCommand == true) {
    messageQueue.push(msg);
  }
});

bot.on('guildMemberRemove', function(user) {
  log.info('[WARN] member remove :' + user.id);

  let index;
  for (const users of data.siege) {
    if (user.id === users.userId) {
      index = data.siege.indexOf(users);
    }
  }
  data.siege.splice(index, 1);
});

bot.on('guildMemberUpdate', function(old, recent) {

  if (data.siege.filter(item => item.id != recent.id).length === 0) {
    if (global.hasUserRole(recent._roles)) {
      data.siege.push({
        userId: recent.user.id,
        userName: recent.user.username,
        nat5def: [],
        nat4def: [],
        lock: {'nat5': false, 'nat4': false},

      });
    }
  }else{
    if (!global.hasUserRole(recent._roles)){
      let index;
      for (const users of data.siege) {
        if (recent.user.id === users.userId) {
          index = data.siege.indexOf(users);
        }
      }
      data.siege.splice(index, 1);
    }
  }

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
      log.info('[WARN] command: ' + data.content + ' - user: ' + data.author.username);
      let messageOperator = data.content.slice(0, 1);
      switch (messageOperator) {
        case _config.operator.setting:
          settings.process(data);
          break;

        case _config.operator.debug:
          debug.process(data);
          break;

        case _config.operator.command:
          command.process(data);
          break;

      }
      messageQueue.splice(i, 1);
    }
  }
}, 500);

// save config
setInterval(function() {
  fs.writeFileSync('./config/config.json', JSON.stringify(_config));
}, 30000);

setInterval(function() {
  fs.writeFileSync(_config.filePath.siege, JSON.stringify(data.siege));
  log.info('[ACTION] save userData');
}, 6000);

