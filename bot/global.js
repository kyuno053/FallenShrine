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
    hasAdminRole: function (roles) {
        let isAdmin = false;

        roles.forEach(function(value,key,map) {
            if(value.id === config.roles.admin){
                isAdmin = true;
            }
        });
        return isAdmin;
    },
    hasUserRole:function (roles) {
        let isUser = false;

        roles.forEach(function(value,key,map) {
            if(value.id === config.roles.users){
                isUser = true;
            }
        });
        return isUser;
    }
};
