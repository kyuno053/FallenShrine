const fs = require('fs');

let bot;
let log;
let config;
let userData;
let global;
let servId;
module.exports = {
  _instanciate: function(_bot, _log, _config, _global, _data) {
    bot = _bot;
    log = _log;
    global = _global;
    config = _config;
    userData = _data.siege;
    log.info('[START] GS sub-module OK');
    console.log('[START] GS sub-module OK');
  },
  management: function(message, args) {
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
          if ((mobs[0] === '' || mobs[0] === undefined) || (mobs[1] === '' || mobs[1] === undefined) || (mobs[2] === '' || mobs[2] === undefined)) {
           message.channel.send( '```css\n#gs addNat5Def: Missing team parameters [ a/b/c ]\n```');
          } else {

            if (mobs.length > 3) {
             message.channel.send( '```css\n#gs your team is too long!\n```');
            } else if (isLocked(message.author.id, 5)) {
             message.channel.send( '```css\n#gs Too much registered teams!\n```');
            } else {

              if (args[args.length - 1] == 'strong') {
                saveDef5Siege(mobs, message.author.id, true);
                message.channel.send( '```css\n#gs your team\n```\n```diff\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Strong team successfully added! \n```');
              } else {
                saveDef5Siege(mobs, message.author.id, false);
                message.channel.send('```css\n#gs your team\n```\n```diff\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Team successfully added! \n```');
              }

            }
          }


          break;
        case 'addNat4Def':
          mobs = unsplit.split('/');
          if ((mobs[0] === '' || mobs[0] === undefined) || (mobs[1] === '' || mobs[1] === undefined) || (mobs[2] === '' || mobs[2] === undefined)) {
            message.channel.send('```css\n#gs addNat4Def: Missing team parameters [ a/b/c ]\n```');
          } else {

            if (mobs.length > 3) {
              message.channel.send( '```css\n#gs your team is too long!\n```');
            } else if (isLocked(message.author.id, 4)) {
              message.channel.send( '```css\n#gs Too much registered teams!\n```');
            } else {

              if (args[args.length - 1] == 'strong') {
                saveDef4Siege(mobs, message.author.id, true);
                message.channel.send('```css\n#gs your team\n```\n```fix\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Strong team successfully added! \n```');
              } else {
                saveDef4Siege(mobs, message.author.id, false);
                message.channel.send('```css\n#gs your team\n```\n```fix\n- ' + mobs[0] + ' ' + mobs[1] + ' ' + mobs[2] + '\n```\n```fix\n+ Team successfully added! \n```');
              }

            }
          }
          break;

        case 'modify':
          if (args[2] !== undefined) {
            modifyTeam(unsplit, message);
          } else {
            message.channel.send('```css\n#gs modify: Missing team parameters [ a/b/c->new_a/new_b/new_c ]\n```');
          }
          break;

        case 'delete':
          if (args[2] !== undefined) {
            deleteTeams(unsplit, message);
          } else {
            message.channel.send( '```css\n#gs delete: Missing team parameters [ a/b/c ]\n```');
          }
          break;


        case 'showMyTeams':
          displayTeamsByUser(message);
          break;

        case 'showAllTeams':
          displayAllTeams(message);

          break;
        case 'reset':
          resetTeamByUser(message);
          break;


        case 'help':
          gsHelp(args, message);
          break;

      }
    } else {
      message.channel.send( '```css\n#gs Missing parameter(s)\n```');
    }
  },

};


/**
 *
 * @param args
 * @param channelID
 */
function gsHelp(args, message) {

  if (args[2] != undefined) {
    switch (args[2]) {
      case 'addNat5Def':
        message.channel.send( '```css\n#gs This command is make for save a defence in 5 stars team in gs. for this, you have to put in the tchat !gs addNat5Def followed by the name of a monster1, separated by a /, followed by the name of a monster2, separated by a /, followed by the name of a monster3.```');
        break;
      case 'addNat4Def':
        message.channel.send( '```css\n#gs This command is make for save a defence in 4 stars team in gs. for this, you have to put in the tchat !gs addNat4Def followed by the name of a monster1, separated by a /, followed by the name of a monster2, separated by a /, followed by the name of a monster3.```');
        break;
      case 'showMyTeams':
        message.channel.send( '```css\n#gs This command will show you all defence team, 4 stars and 5 stars, that you have saved in the bot.```');
        break;
      case 'showAllTeams':
        message.channel.send( '```css\n#gs This command will show all teams, 4 stars and 5 stars, saved in the bot, of all players who are registerd.\n[ONLY FOR ADMIN USERS!]```');
        break;
      case 'reset':
        message.channel.send( '```css\n#gs This command will reset all teams added by the user who use it.```');
        break;
      case 'modify':
        message.channel.send('```css\n#gs This command will modify a team. [synthax example: !gs modify seara/orion/perna->jeanne/perna/taranys][tips: actual team -> new team]```');
        break;
      case 'delete':
        message.channel.send( '```css\n#gs This command will delete a team.```');
        break;
      case 'help':
        message.channel.send( 'https://tenor.com/view/hopeless-disappointed-ryan-reynolds-facepalm-embarrassed-gif-5436796');
        break;


    }
  } else {
    message.channel.send( '```css\n !gs addNat5Def monster1/monster2/monster3 : Add a 5 star tower def in gs defence team.' +
        '\n !gs addNat4Def monster1/monster2/monster3 : Add a 4 star tower def in gs defence team.' +
        '\n !gs showMyTeams : Show all defence team you have saved.' +
        '\n !gs showAllTeams : Show all teams of all players.[ADMIN ONLY]' +
        '\n !gs modify : Modify a team.' +
        '\n !gs delete : Delete a team.' +
        '\n !gs reset : Reset all teams added by a user. ```');

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
  for (let user of userData) {
    if (user.userId === userId) {
      user.nat4def.push(data);
    }
  }
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
  for (let user of userData) {
    if (user.userId === userId) {
      user.nat5def.push(data);
    }
  }
}

function deleteTeams(args, message) {
  let actual = args.split('/');
  let isFound = false;
  for (let user of userData) {
    if (user.userId === message.author.id) {

      for (let def4 of user.nat4def) {
        if (isFound === false) {
          if (def4.first === actual[0] && def4.second === actual[1] && def4.third === actual[2]) {
            isFound = true;
            user.nat4def.splice(user.nat4def.indexOf(def4), 1);
          }
        }
      }
      for (let def5 of user.nat5def) {
        if (isFound === false) {
          if (def5.first === actual[0] && def5.second === actual[1] && def5.third === actual[2]) {
            isFound = true;
            const index = user.nat5def.indexOf(def5);
            user.nat5def.splice(index, 1);
          }


        }
      }
      if (isFound === true) {
        message.channel.send( '```diff\n+ Team successfully deleted! \n```');
      } else {
        message.channel.send('```diff\n- Team not found! \n```');
      }
    }

  }


}

function modifyTeam(args, message) {

  let teams = args.split('->');
  let actual = teams[0].split('/');
  let future = teams[1].split('/');
  let isFound = false;
  for (let user of userData) {
    if (user.userId === message.author.id) {

      for (let def4 of user.nat4def) {
        if (isFound === false) {
          if (def4.first === actual[0] && def4.second === actual[1] && def4.third === actual[2]) {
            isFound = true;
            user.nat4def.splice(user.nat4def.indexOf(def4), 1);
            saveDef4Siege(future, message.author.id, false);
          }
        }
      }
      for (let def5 of user.nat5def) {
        if (isFound === false) {
          if (def5.first === actual[0] && def5.second === actual[1] && def5.third === actual[2]) {
            isFound = true;
            const index = user.nat5def.indexOf(def5);
            user.nat5def.splice(index, 1);
            saveDef5Siege(future, message.author.id, false);
          }


        }
      }
      if (isFound === true) {
        message.channel.send( '```diff\n+ Team successfully changed! \n```');
      } else {
        message.channel.send( '```diff\n- Team not found! \n```');
      }
    }
  }


}

function isLocked(userId, nat) {
  let is5Locked = false;
  let is4Locked = false;

  for (let user of userData) {
    if (user.userId === userId) {
      if (user.nat5def.length === config.parameters.gs.nb5nat) {
        is5Locked = true;
      }
      if (user.nat4def.length === config.parameters.gs.nb4nat) {
        is4Locked = true;
      }
      user.lock.nat5 = is5Locked;
      user.lock.nat4 = is4Locked;

    }
  }

  if (nat === 4) {
    return is4Locked;
  }
  if (nat === 5) {
    return is5Locked;
  }

}

function displayTeamsByUser(msg) {

  let message = '```css\n#defs Your teams:\n```\n\n```css\n-4 nat:```\n```diff\n';
  for (let user of userData) {
    if (user.userId === msg.author.id) {

      if (user.nat4def.length > 0) {
        for (let def of user.nat4def) {
          message += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        message += '- Nothing registered';
      }

      message += '```\n```css\n-5 nat:```\n```fix\n';

      if (user.nat5def.length > 0) {
        for (let def of user.nat5def) {
          message += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        message += '- Nothing registered';
      }

      message += '```';
    }
  }

  msg.channel.send(message);

}

function displayAllTeams(msg) {


  if ((msg.author.id === msg.guild.ownerID) || global.hasAdminRole(msg.member.roles.cache)) {
    let message = '```css\n#defs Registered teams:\n```\n';

    for (let user of userData) {

      let userMsg = '```css\n#' + user.userName + ':```\n```css\n-4 nat:```\n```diff\n';
      if (user.nat4def.length > 0) {
        for (let def of user.nat4def) {
          userMsg += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        userMsg += '- Nothing registered';
      }

      userMsg += '```\n```css\n-5 nat:```\n```fix\n';

      if (user.nat5def.length > 0) {
        for (let def of user.nat5def) {
          userMsg += '- ' + def.first + ' - ' + def.second + ' - ' + def.third + '\n';
        }
      } else {
        userMsg += '- Nothing registered';
      }

      userMsg += '```\n';
      message += userMsg;

    }

   msg.channel.send(message);

  } else {
   msg.channel.send( '```diff\n- Unauthorized request!```');
  }


}

function resetTeamByUser(message) {
  for (let user of userData) {
    if (user.userId === message.author.id) {
      user.nat5def = [];
      user.nat4def = [];
    }
  }
  message.channel.send( '```css\n#defs  Reset teams\n```\n```diff\n- Your defs are now reset\n```');

}





