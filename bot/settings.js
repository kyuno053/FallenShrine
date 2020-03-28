const fs = require('fs');

let bot;
let config;
let log;
let servId;
let global;
module.exports = {
    /**
     *  Inject global variables
     */
    _instanciate: function (_bot,_config,_log,_servId,_global) {
        bot = _bot;
        config = _config;
        log = _log;
        global = _global;
        log.info("[START] Settings module OK");
        console.log("[START] Settings module OK");
    },

    process: function(user, userID, channelID, message) {
        let args = message.slice(1, message.length).split(' ');

        switch (args[0]) {

            case 'settings':
                settingsManagement(user, userID, channelID, args);
                break;

        }
    }
};

function settingsManagement(user, userID, channelID, args) {
    servId = bot.channels[channelID].guild_id;
    if ((bot.servers[servId].owner_id === userID) || (global.hasAdminRole(userID,servId) === true)) {
        switch (args[1]) {
            case 'setChannel':
                if (args[2] !== undefined) {

                    switch (args[2]) {
                        case 'gs':
                            config.channels.gs = channelID;
                            bot.sendMessage({
                                to: channelID,
                                message: '```diff\n+ channel set for GS content!```',
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
                    addRole(args[2],"admin");
                    bot.sendMessage({
                        to: channelID,
                        message: '```diff\n+ Admin role '+args[2]+' added```',
                    });

                }
                break;
            case 'setUsersRole':
                if (args[2] !== undefined) {
                    addRole(args[2],"users");
                    bot.sendMessage({
                        to: channelID,
                        message: '```diff\n+ User role '+args[2]+' added```',
                    });

                }
                break;
            case 'generateSiegeFile':
                generateUsers();
                bot.sendMessage({
                    to: channelID,
                    message: '```diff\n- Force Siege file generation```',
                });
                break;
        }

    } else {
        bot.sendMessage({
            to: channelID,
            message: '```diff\n- Unauthorized request!```',
        });
    }
}


function generateUsers() {

        let data = [];
        for (let user in bot.users) {
            if (! bot.users[user].bot) {
                data.push({
                    userId:  bot.users[user].id,
                    nat5def: [],
                    nat4def: [],
                    lock: {'nat5': false, 'nat4': false},

                });
            }
        }
        fs.writeFile(config.filePath.siege, JSON.stringify(data), function(err) {
            if (err) throw err;
        });

}
function addRole(roleName,category){
    let roleId = null;
    let botRoles = [];
    botRoles = bot.servers[servId].roles;
    Object.keys(botRoles).forEach(item => {
        if (botRoles[item].name === roleName) {
            roleId = botRoles[item].id;
        }
    });
   switch(category){
       case "admin":
           config.roles.admin.push(roleId);
           break;
       case "users":
           config.roles.users.push(roleId);
           break;
   }
}
