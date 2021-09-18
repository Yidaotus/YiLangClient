const path = require(`path`);
const alias = require(`./src/config/aliases`);

const SRC = `./src`;
const aliases = alias(SRC);

const resolvedAliases = Object.entries(aliases).reduce((acc, [key, value]) => {
	acc[key] = path.resolve(__dirname, value);
	return acc;
}, {});

module.exports = {
	webpack: {
		alias: resolvedAliases,
	},
};
