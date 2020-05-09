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
  process: function(message) {
    servId = message.guild.id;
    let args = message.content.slice(1, message.length).split(' ');
    if ((message.guild.ownerID === message.author.id) || (global.hasAdminRole(message.member.roles.cache) === true)) {
      switch (args[0]) {
        case 'ping':
          message.channel.send('```css\n#debug pong!\n```');
          break;
        case 'siegeFile':
          message.channel.send('```css\n#debug   UserFile exists :' + fs.existsSync(config.filePath.siege) + '\n```');
          break;
        case 'userCount':
         message.channel.send('```css\n#debug   userCount:' + data.siege.length + '\n```');
          break;
      }
    }else{
       message.channel.send('```diff\n- Unauthorized request!```');
    }
  },
};
