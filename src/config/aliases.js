const aliases = (prefix = `src`) => ({
	'@store': `${prefix}/store`,
	'@components': `${prefix}/components`,
	'@editor': `${prefix}/components/Editor`,
	'@helpers': `${prefix}/helpers`,
	'@hooks': `${prefix}/hooks`,
	'@views': `${prefix}/views`,
	'@config': `${prefix}/config`,
});

module.exports = aliases;
