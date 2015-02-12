//TODO: move to mongodb
var userDict = {}

module.exports = {
    findUser : function(userHash) {
        return userDict[userHash];
    },

    saveUser : function(hash, email, phone, name) {
        var user = {
            hash: hash,
            name: name,
            email: email,
            phone: phone
        }
        userDict[hash] = user;
        return true;
    },

    pinLocalityLookup : function() {


    }

};