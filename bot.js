let Discord = require('discord.io');
const cors = require('cors');
const express = require('express');
const token = require('./config/auth').token;
const configPath = './config/general.json';
const log = require('simple-node-logger').createSimpleFileLogger('./bot.log');
let config;
let userData = null;
let fs = require('fs');
let srv = express();
let servId = null;
let messageQueue = [];
let bot = new Discord.Client({
  token: token,
  autorun: true,
});
let corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200,
};
srv.use(cors(corsOptions));
srv.listen(3250, function() {
  console.log('[INFO] data service work on port 3250');
  log.info('[INFO] data service work on port 3250');
});

srv.route('/allDefs').get((req, res) => {
  res.send(fs.readFileSync('./defs/defSiege.json'));
  res.end();
});
srv.route('/allMobs').get((req, res) => {
  res.send(fs.readFileSync('./assets/mobs.json'));
  res.end();
});


bot.on('ready', function() {
  log.info('Bot ready! - connected: ' + bot.connected);
  console.log('Bot ready! - connected: ' + bot.connected);
  userList = bot.users;

  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }
  } catch (err) {
    log.error(err);
  }

  try {
    if (fs.existsSync('./defs/defSiege.json')) {
      userData = JSON.parse(fs.readFileSync('./defs/defSiege.json'));
    } else {
      generateUsers();
    }
  } catch (err) {
    log.error(err);
  }

});
bot.setPresence({
  game: {
    name: 'V0.9.5',
    type: 1,
    url: 'https://github.com/kyuno053/FallenShrine',
  },
});

bot.on('disconnect', function(erMsg, code) {
  log.info('----- Bot disconnected from Discord with code: ', code, ' for reason:', erMsg, '-----');
});

bot.on('message', function(user, userID, channelID, message, event) {

  if (servId == null) {
    servId = bot.channels[channelID].guild_id;
  }

  const data = {
    'user': user,
    'userID': userID,
    'channelID': channelID,
    'message': message,
    'event': event,
  };
  messageQueue.push(data);
});
bot.on('guildMemberAdd', function(user) {
  console.log('member add:' + user.toString());
  if (!user.bot) {
    userData.users.push({
      userId: user.id,
      username: user.username,
      siege: {nat5def: [], nat4def: [], lock: {'nat5': false, 'nat4': false}},
    });
    fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
      if (err) throw err;
    });
  }


});

bot.on('guildMemberRemove', function(user) {
  log.info('[WARN] member remove :' + user.toString());
  let index;
  for (const users of userData.users) {
    if (user.id === users.userId) {
      index = userData.users.indexOf(users);
    }
  }
  userData.users.splice(index, 1);
  fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
    if (err) throw err;
  });
});

/**
 * function to process the queue
 */
setInterval(function() {
  if (messageQueue.length !== 0) {
    for (let i = messageQueue.length - 1; i >= 0; i--) {
      let data = messageQueue[i];
      log.info('[WARN] command: '+data.message+' - user: '+data.user);
      let messageOperator = data.message.slice(0, 1);
      switch (messageOperator) {

        case config.operator.debug:
          debugProcess(data.user, data.userID, data.channelID, data.message);
          break;
        case config.operator.command:
          commandProcess(data.user, data.userID, data.channelID, data.message);
          break;

        case config.operator.setting:
          settingProcess(data.user, data.userID, data.channelID, data.message);
          break;
      }
      messageQueue.splice(i, 1);
    }
  }
}, 500);


/**
 * Poll tu test connection
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
        try {
          if (fs.existsSync('./defs/defSiege.json')) {
            userData = JSON.parse(fs.readFileSync('./defs/defSiege.json'));
          } else {
            generateUsers();
          }
        } catch (err) {
          log.error(err);
        }
      }
    }, 1000);
  }
}, 6000);

/**
 *Poll to refresh UserData
 *
 */

setInterval(function() {
  if (fs.existsSync('./defs/defSiege.json')) {
    userData = JSON.parse(fs.readFileSync('./defs/defSiege.json'));
  }
  log.info('[ACTION] reload userData');

}, 6000);

setInterval(function() {
  fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
    if (err) throw err;
  });
  log.info('[ACTION] save userData');
},5900);

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param message
 */


function debugProcess(user, userID, channelID, message) {

  let args = message.slice(1, message.length).split(' ');
  switch (args[0]) {
    case 'ping':
      bot.sendMessage({
        to: channelID,
        message: '```css\n#debug pong!\n```',
      });
      break;
    case 'userFile':
      bot.sendMessage({
        to: channelID,
        message: '```css\n#debug   UserFile exists :' + fs.existsSync('./defs/defSiege') + '\n```',
      });
      break;
  }


}

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param message
 */

function commandProcess(user, userID, channelID, message) {

  let args = message.slice(1, message.length).split(' ');

  switch (args[0]) {

    case 'gs':
      if (channelID !== config.channels.gs) {
        bot.sendMessage({
          to: channelID,
          message: '```diff\n- Wrong channel\nPlease go on the dedicated channel!```',
        });
      } else {
        gsManagement(user, userID, config.channels.gs, args);
      }
      break;

    case 'site':
      bot.sendMessage({
        to: channelID,
        message: 'https://tenor.com/view/im-working-on-it-im-trying-work-in-progress-john-krasinski-jack-ryan-gif-15585568',
      });
      break;
  }


}


/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param message
 */


function settingProcess(user, userID, channelID, message) {
  let args = message.slice(1, message.length).split(' ');

  switch (args[0]) {

    case 'settings':
      settingsManagement(user, userID, channelID, args);
      break;

  }
}

/* #############################    GS FUNCTIONS     #####################################*/

/**
 *
 * @param user
 * @param userID
 * @param channelID
 * @param args
 */

function gsManagement(user, userID, channelID, args) {

  if (args.length > 1) {

    args_copy = [...args];
    args_copy.splice(0, 2);
    unsplit = '';
    for (let i = 0; i < args_copy.length; i++) {
      unsplit = unsplit + args_copy[i];
      if (args_copy[i + 1] !== undefined) {
        unsplit = unsplit + ' ';
      }
    }
    if (unsplit.substr(0, 1) === ' ') {
      unsplit = unsplit.substr(1);
    }

    let mobs = null;
    switch (args[1]) {

      case 'addNat5Def':

        mobs = unsplit.split('/');
        if (mobs.length > 3) {
          bot.sendMessage({
            to: channelID,
            message: '```css\n#gs your team is too long!\n```',
          });
        } else if (isLocked(userID, 5)) {
          bot.sendMessage({
            to: channelID,
            message: '```css\n#gs Too much registered teams!\n```',
          });
        } else {

          if (args[args.length - 1] == 'strong') {
            saveDef5Siege(mobs, userID, true);
            bot.sendMessage({
              to: channelID,
              message: '```css\n#gs your team\n```\n```diff\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Strong team successfully added! \n```',
            });
          } else {
            saveDef5Siege(mobs, userID, false);
            bot.sendMessage({
              to: channelID,
              message: '```css\n#gs your team\n```\n```diff\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Team successfully added! \n```',
            });
          }

        }

        break;
      case 'addNat4Def':

        mobs = unsplit.split('/');
        if (mobs.length > 3) {
          bot.sendMessage({
            to: channelID,
            message: '```css\n#gs your team is too long!\n```',
          });
        } else if (isLocked(userID, 4)) {
          bot.sendMessage({
            to: channelID,
            message: '```css\n#gs Too much registered teams!\n```',
          });
        } else {

          if (args[args.length - 1] == 'strong') {
            saveDef4Siege(mobs, userID, true);
            bot.sendMessage({
              to: channelID,
              message: '```css\n#gs your team\n```\n```fix\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Strong team successfully added! \n```',
            });
          } else {
            saveDef4Siege(mobs, userID, false);
            bot.sendMessage({
              to: channelID,
              message: '```css\n#gs your team\n```\n```fix\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Team successfully added! \n```',
            });
          }

        }

        break;

      case 'modify':

        modifyTeam(unsplit, userID, channelID);
        break;

      case 'delete':
        deleteTeams(unsplit, userID, channelID);
        break;


      case 'showMyTeams':
        displayTeamsByUser(userID, channelID);
        break;

      case 'showAllTeams':
        displayAllTeams(userID, channelID);

        break;
      case 'reset':
        resetTeamByUser(userID, channelID);
        break;


      case 'help':
        gsHelp(args, channelID);
        break;

    }
  } else {
    bot.sendMessage({
      to: channelID,
      message: '```css\n#gs Missing parameter(s)\n```',
    });
  }
}

/**
 *
 * @param args
 * @param channelID
 */
function gsHelp(args, channelID) {

  if (args[2] != undefined) {
    switch (args[2]) {
      case 'addNat5Def':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command is make for save a defence in 5 stars team in gs. for this, you have to put in the tchat !gs addNat5Def followed by the name of a monster1, separated by a /, followed by the name of a monster2, separated by a /, followed by the name of a monster3.```',
        });
        break;
      case 'addNat4Def':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command is make for save a defence in 4 stars team in gs. for this, you have to put in the tchat !gs addNat4Def followed by the name of a monster1, separated by a /, followed by the name of a monster2, separated by a /, followed by the name of a monster3.```',
        });
        break;
      case 'showMyTeams':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command will show you all defence team, 4 stars and 5 stars, that you have saved in the bot.```',
        });
        break;
      case 'showAllTeams':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command will show all teams, 4 stars and 5 stars, saved in the bot, of all players who are registerd.\n[ONLY FOR ADMIN USERS!]```',
        });
        break;
      case 'reset':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command will reset all teams added by the user who use it.```',
        });
        break;
      case 'modify':
        bot.sendMessage({
          to: channelID,
          message: '```css\n#gs This command will modify a team. [synthax example: !gs modify seara/orion/perna->jeanne/perna/taranys][tips: actual team -> new team]```',
        });
        break;
      case 'help':
        bot.sendMessage({
          to: channelID,
          message: 'https://tenor.com/view/hopeless-disappointed-ryan-reynolds-facepalm-embarrassed-gif-5436796',
        });
        break;


    }
  } else {
    bot.sendMessage({
      to: channelID,
      message: '```css\n !gs addNat5Def monster1/monster2/monster3 : Add a 5 star tower def in gs defence team.' +
        '\n !gs addNat4Def monster1/monster2/monster3 : Add a 4 star tower def in gs defence team.' +
        '\n !gs showMyTeams : Show all defence team you have saved.' +
        '\n !gs showAllTeams : Show all teams of all players.[ADMIN ONLY]' +
        '\n !gs modify : Modify a team.' +
        '\n !gs reset : Reset all teams added by a user. ```',
    });

  }


}

function modifyTeam(args, userId, channelId) {

  let teams = args.split('->');
  let actual = teams[0].split('/');
  let future = teams[1].split('/');
  let isFound = false;
  for (let user of userData.users) {
    if (user.userId === userId) {

      for (let def4 of user.siege.nat4def) {
        if (isFound === false) {
          if (def4.first === actual[0] && def4.second === actual[1] && def4.third === actual[2]) {
            isFound = true;
            user.siege.nat4def.splice(user.siege.nat4def.indexOf(def4), 1);
            saveDef4Siege(future, userId, false);
          }
        }
      }
      for (let def5 of user.siege.nat5def) {
        if (isFound === false) {
          if (def5.first === actual[0] && def5.second === actual[1] && def5.third === actual[2]) {
            isFound = true;
            const index = user.siege.nat5def.indexOf(def5);
            user.siege.nat5def.splice(index, 1);
            saveDef5Siege(future, userId, false);
          }


        }
      }
    }
    if (isFound === true) {
      bot.sendMessage({
        to: channelId,
        message: '```diff\n+ Team successfully changed! \n```',
      });
    } else {
      bot.sendMessage({
        to: channelId,
        message: '```diff\n- Team not found! \n```',
      });
    }
  }


}

function deleteTeams(args, userId, channelId) {
  let actual = args.split('/');
  let isFound = false;
  for (let user of userData.users) {
    if (user.userId === userId) {

      for (let def4 of user.siege.nat4def) {
        if (isFound === false) {
          if (def4.first === actual[0] && def4.second === actual[1] && def4.third === actual[2]) {
            isFound = true;
            user.siege.nat4def.splice(user.siege.nat4def.indexOf(def4), 1);
          }
        }
      }
      for (let def5 of user.siege.nat5def) {
        if (isFound === false) {
          if (def5.first === actual[0] && def5.second === actual[1] && def5.third === actual[2]) {
            isFound = true;
            const index = user.siege.nat5def.indexOf(def5);
            user.siege.nat5def.splice(index, 1);
          }


        }
      }
    }
    if (isFound === true) {
      bot.sendMessage({
        to: channelId,
        message: '```diff\n+ Team successfully deleted! \n```',
      });
    } else {
      bot.sendMessage({
        to: channelId,
        message: '```diff\n- Team not found! \n```',
      });
    }
  }


}

/**
 *
 * @param args
 * @param userId
 */

function saveDef4Siege(args, userId, isStrong) {
  let data;

  for (let i = 0; i < args.length; i++) {
    data = {
      first: args[0],
      second: args[1],
      third: args[2],
      isStrong: isStrong,
    };
  }
  for (let user of userData.users) {
    if (user.userId === userId) {
      user.siege.nat4def.push(data);
    }
  }
  fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
    if (err) throw err;
  });
}


/**
 *
 * @param args
 * @param userId
 */

function saveDef5Siege(args, userId, isStrong) {
  let data;

  for (let i = 0; i < args.length; i++) {
    data = {
      first: args[0],
      second: args[1],
      third: args[2],
      isStrong: isStrong,
    };
  }
  for (let user of userData.users) {
    if (user.userId === userId) {
      user.siege.nat5def.push(data);
    }
  }
  fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
    if (err) throw err;
  });
}


/**
 *
 * @param userId
 */

function isLocked(userId, nat) {
  let is5Locked = false;
  let is4Locked = false;

  for (let user of userData.users) {
    if (user.userId === userId) {
      if (user.siege.nat5def.length === config.userDefLockParam.nb5nat) {
        is5Locked = true;
      }
      if (user.siege.nat4def.length === config.userDefLockParam.nb4nat) {
        is4Locked = true;
      }
      user.siege.lock.nat5 = is5Locked;
      user.siege.lock.nat4 = is4Locked;

    }
  }

  if (nat === 4) {
    return is4Locked;
  }
  if (nat === 5) {
    return is5Locked;
  }

}

/**
 *
 * @param userId
 * @param chanelId
 */
function displayTeamsByUser(userId, chanelId) {

  let message = '```css\n#defs Your teams:\n```\n\n```css\n-4 nat:```\n```diff\n';
  for (let user of userData.users) {
    if (user.userId === userId) {

      if (user.siege.nat4def.length > 0) {
        for (let def of user.siege.nat4def) {
          message += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        message += '- Nothing registered';
      }

      message += '```\n```css\n-5 nat:```\n```fix\n';

      if (user.siege.nat5def.length > 0) {
        for (let def of user.siege.nat5def) {
          message += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        message += '- Nothing registered';
      }

      message += '```';
    }
  }

  bot.sendMessage({
    to: chanelId,
    message: message,
  });

}

/**
 *
 * @param userId
 * @param channelId
 */
function displayAllTeams(userId, channelId) {


  if (userId === bot.servers[Object.keys(bot.servers)[0]].owner_id) {
    let message = '```css\n#defs Registered teams:\n```\n';

    for (let user of userData.users) {

      let userMsg = '```css\n#' + user.username + ':```\n```css\n-4 nat:```\n```diff\n';
      if (user.siege.nat4def.length > 0) {
        for (let def of user.siege.nat4def) {
          userMsg += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        userMsg += '- Nothing registered';
      }

      userMsg += '```\n```css\n-5 nat:```\n```fix\n';

      if (user.siege.nat5def.length > 0) {
        for (let def of user.siege.nat5def) {
          userMsg += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        userMsg += '- Nothing registered';
      }

      userMsg += '```\n';
      message += userMsg;

    }

    bot.sendMessage({
      to: channelId,
      message: message,
    });

  } else {
    bot.sendMessage({
      to: channelId,
      message: '```diff\n- Unauthorized request!```',
    });
  }


}

/**
 *
 * @param userId
 * @param channelId
 */
function resetTeamByUser(userId, channelId) {
  bot.sendMessage({
    to: channelId,
    message: '```css\n#defs  Reset teams\n```\n```diff\n- Your defs are now reset\n```',
  });
  for (let user of userData.users) {
    if (user.userId === userId) {
      user.siege.nat5def = [];
      user.siege.nat4def = [];

      fs.writeFile(config.path.defSiege, JSON.stringify(userData), function(err) {
        if (err) throw err;
      });
    }
  }

}


/* #############################    SETTINGS FUNCTIONS     #####################################*/


function settingsManagement(user, userID, channelID, args) {
  if ((bot.servers[servId].owner_id === userID) || (hasAdminRole(userID) === true)) {
    switch (args[1]) {
      case 'generateUserFile':

        if (config.userLock === true && args[2] === undefined) {
          bot.sendMessage({
            to: channelID,
            message: '```diff\n- File already exist!```',
          });
        } else if (config.userLock === true && args[2] === 'force') {
          bot.sendMessage({
            to: channelID,
            message: '```diff\n- Force UserFile generation```',
          });
          config.userLock = false;
          generateUsers();
        } else {
          generateUsers();
        }
        break;

      case 'setChannel':
        if (args[2] !== undefined) {

          switch (args[2]) {
            case 'gs':
              config.channels.gs = channelID;
              bot.sendMessage({
                to: channelID,
                message: '```diff\n+ channel set for GS content!```',
              });
              fs.writeFile(configPath, JSON.stringify(config), function(err) {
                if (err) throw err;
              });
              break;
          }
        } else {
          bot.sendMessage({
            to: channelID,
            message: '```diff\n- Missing parameter!```',
          });
        }

        break;

      case 'setAdminRole':
        if (args[2] !== undefined) {
          let roleId = null;
          let botRoles = [];
          botRoles = bot.servers[servId].roles;
          Object.keys(botRoles).forEach(item => {
            if (botRoles[item].name === args[2]) {
              roleId = botRoles[item].id;
            }
          });
          config.adminRoles.push(roleId);


          fs.writeFile(configPath, JSON.stringify(config), function(err) {
            if (err) throw err;
          });
        }
        break;
    }

  } else {
    bot.sendMessage({
      to: channelID,
      message: '```diff\n- Unauthorized request!```',
    });
  }
}


/**
 *
 *
 *
 */

function generateUsers() {
  if (!config.userLock) {
    let data = {users: []};
    for (let user in userList) {
      if (!userList[user].bot) {
        data.users.push({
          userId: userList[user].id,
          username: userList[user].username,
          siege: {
            nat5def: [],
            nat4def: [],
            lock: {'nat5': false, 'nat4': false},
          },
        });
      }
    }
    fs.writeFile(config.path.defSiege, JSON.stringify(data), function(err) {
      if (err) throw err;
    });
    config.userLock = true;
    fs.writeFile(configPath, JSON.stringify(config), function(err) {
      if (err) throw err;
    });
  }
}


function hasAdminRole(userID) {
  let isAdmin = false;

  bot.servers[servId].members[userID].roles.forEach(item => {
    if (config.adminRoles.includes(item) && isAdmin === false) {
      isAdmin = true;
    }
  });
  return isAdmin;
}
