module.exports = function(start) {

    if(!start) {
        return process.hrtime();
    }

    var end = process.hrtime(start);

    return Math.round((end[0]*1000) + (end[1]/1000000));
};
