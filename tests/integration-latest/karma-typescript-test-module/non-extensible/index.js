var nonExtensibleObject = { a: 'b' };

Object.preventExtensions(nonExtensibleObject);

exports.default = nonExtensibleObject;

module.exports = exports.default;