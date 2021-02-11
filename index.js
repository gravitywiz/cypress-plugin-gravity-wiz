const execa = require('execa')

module.exports = {
    initGravityWiz: (on, config, { activatePlugins }) => {
        // Copy GF_KEY into Cypress env
        config.env.gf_key = process.env.GF_KEY

        if (!activatePlugins) {
            activatePlugins = [];
        }

        console.info('Initializing test run for Gravity Wiz...');

        console.info('Installing and activating Gravity Forms CLI...');
        execa.sync('wp', ['plugin', 'install', '--activate', 'gravityformscli'])

        console.info('Activating Gravity Forms and Perks...');
        execa.sync('wp', ['plugin', 'activate', 'gravityforms', 'gravityperks', ...activatePlugins])

        return config;
    }
}