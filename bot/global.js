let config;
let bot;
let log;
module.exports = {
    /**
     *
     * @param _bot
     * @param _config
     * @param _log
     * @private
     */
    _instanciate: function (_bot,_config,_log) {
        config = _config;
        bot = _bot;
        log=_log;
        log.info("[START] Global module OK");
        console.log("[START] Global module OK");
    },
    /**
     *
     * @param userID
     * @param servId
     * @returns {boolean}
     */
    hasAdminRole: function (userID, servId) {
        let isAdmin = false;

        bot.servers[servId].members[userID].roles.forEach(item => {
            if (config.roles.admin.includes(item) && isAdmin === false) {
                isAdmin = true;
            }
        });
        return isAdmin;
    },
    hasUserRole:function (userID,servId) {
        let isUser = false;

        bot.servers[servId].members[userID].roles.forEach(item => {
            if (config.roles.users.includes(item) && isUser === false) {
                isUser = true;
            }
        });
        return isUser;
    }
};
