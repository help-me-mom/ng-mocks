const path = require('path');

module.exports = {
  '*': filenames => {
    const commands = [];
    const cwd = process.cwd();
    const files = filenames.map(file => path.relative(cwd, file)).map(file => `'${file}'`);
    if (files.length === 0) {
      return [];
    }

    commands.push(`prettier -u -w ${files.join(' ')}`);

    return commands;
  },
};
