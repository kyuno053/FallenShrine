const fs = require('fs');

let bot;
let log;
let config;
let data;
let servId;
let global;
module.exports = {
  _instanciate: function(_bot, _config, _log, _data,_global) {
    config = _config;
    bot = _bot;
    log = _log;
    data = _data;
    global = _global;
    log.info('[START] Debug module OK');
    console.log('[START] Debug module OK');
  },
  process: function(user, userID, channelID, message) {
    servId = bot.channels[channelID].guild_id;
    let args = message.slice(1, message.length).split(' ');
    if ((bot.servers[servId].owner_id === userID) || (global.hasAdminRole(userID, servId) === true)) {
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
        case 'userCount':
          bot.sendMessage({
            to: channelID,
            message: '```css\n#debug   userCount:' + data.siege.length + '\n```',
          });
          break;
      }
    }else{
        bot.sendMessage({
            to: channelID,
            message: '```diff\n- Unauthorized request!```',
        });
    }
  },
};
