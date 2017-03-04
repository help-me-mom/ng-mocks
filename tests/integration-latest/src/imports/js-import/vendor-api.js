// ES5 version
var urls = require("./urls");

module.exports = {
    list: function(authToken, parameters){
        return {
            method: "POST",
            url: urls.vendor.create,
            headers: {
                authorization: "token " + authToken
            },
            data: parameters
        };
    }
};

/*
// ES6 version
const urls = require("./urls");

module.exports = {
    list(authToken, parameters){
        return {
            method: "POST",
            url: urls.vendor.create,
            headers: {
                authorization: `token ${authToken}`
            },
            data: parameters
        };
    }
};

*/
