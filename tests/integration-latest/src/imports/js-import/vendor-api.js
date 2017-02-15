const urls = require('./urls');

module.exports = {
    list(authToken, parameters){
        return {
            method: 'POST',
            url: urls.vendor.create,
            headers: {
                authorization: `token ${authToken}`
            },
            data: parameters
        };
    }
};
