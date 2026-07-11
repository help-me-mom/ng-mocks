const path = require('path');

const command = binary => filenames => {
  const cwd = process.cwd();
  const files = filenames.map(file => path.relative(cwd, file)).map(file => `'${file}'`);

  return files.length === 0 ? [] : `${binary} ${files.join(' ')}`;
};

module.exports = {
  '*.{cjs,css,html,js,json,jsx,md,mdx,mjs,scss,ts,tsx,yaml,yml}': command('prettier -w'),
  '*.{cjs,js,jsx,mjs,ts,tsx}': command('eslint --fix'),
};
