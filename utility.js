var userDict = {}

module.exports = {
    findUser : function(userHash) {
        return userDict[userHash];
    },

    saveUser : function(hash, name, email, phone) {
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