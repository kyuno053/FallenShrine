const fs = require('fs');

let bot;
let config;
let log;
let servId;
let global;
let data;
module.exports = {
    /**
     *  Inject global variables
     */
    _instanciate: function (_bot,_config,_log,_global,_data) {
        bot = _bot;
        config = _config;
        log = _log;
        global = _global;
        data = _data;
        log.info("[START] Settings module OK");
        console.log("[START] Settings module OK");
    },

    process: function(message) {
        let args = message.content.slice(1, message.content.length).split(' ');
        servId = message.guild.id;
        switch (args[0]) {

            case 'settings':
                settingsManagement(message, args);
                break;

        }
    }
};

function settingsManagement(message, args) {

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

    if ((message.guild.ownerID === message.author.id) || (global.hasAdminRole(message.member.roles.cache) === true)) {

        switch (args[1]) {
            case 'setChannel':
                if (args[2] !== undefined) {

                    switch (args[2]) {
                        case 'gs':
                            config.channels.gs = message.channel.id;
                            message.channel.send( '```diff\n+ channel set for GS content!```');
                            break;
                        case 'music':
                            config.channels.music = message.channel.id;
                            message.channel.send( '```diff\n+ channel set for MUSIC content!```');
                            break;
                    }
                } else {
                    message.channel.send('```diff\n- Missing parameter!```');
                }

                break;

            case 'setAdminRole':
                if (args[2] !== undefined) {
                   let done = addRole(unsplit,"admin");
                   if(done === true){
                       message.channel.send( '```diff\n+ Admin role '+unsplit+' added```');
                   }else{
                       message.channel.send('```diff\n- Role not found```');
                   }
                }else{
                    message.channel.send('```diff\n- Missing parameters!```');
                }
                break;
            case 'setUsersRole':
                if (args[2] !== undefined) {
                    let done = addRole(unsplit,"users");
                    if(done === true){
                        message.channel.send( '```diff\n+ User role '+unsplit+' added```');
                    }else{
                        message.channel.send('```diff\n- Role not found```');
                    }

                }else{
                    message.channel.send('```diff\n- Missing parameters!```');
                }
                break;
            case 'generateSiegeFile':
                generateUsers(message);
                message.channel.send( '```diff\n- Force Siege file generation```');
                break;
        }

    } else {
            message.channel.send('```diff\n- Unauthorized request!```');
    }
}


function generateUsers(message) {
        let members = message.guild.roles.cache.get(config.roles.users).members;
        let siege = [];

        members.forEach(function(value, key, map) {
            if (value.user.bot != true) {
                    siege.push({
                        userId: value.user.id,
                        userName:value.user.username,
                        nat5def: [],
                        nat4def: [],
                        lock: {'nat5': false, 'nat4': false},

                    });
            }
        })

       data.siege = siege;

}
function addRole(roleName,category){
    let roleId = null;
    let botRoles = bot.guilds.cache.get(servId).roles.cache;
    botRoles.forEach(function(value, key, map) {
       if(value.name === roleName){
           roleId = value.id;
       }
    });
    if (roleId !== null){
        switch(category){
            case "admin":
                config.roles.admin = roleId;
                break;
            case "users":
                config.roles.users = roleId;
                break;
        }

        return true;
    }else{
        return false;
    }

}
