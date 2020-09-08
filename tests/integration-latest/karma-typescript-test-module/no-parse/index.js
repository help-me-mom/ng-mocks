module.exports = function() {
    return '\033[0f'; // makes acorn barf, "Octal literal in strict mode"
};