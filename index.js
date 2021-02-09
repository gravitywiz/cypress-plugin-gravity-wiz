const { execFileSync } = require('child_process')

module.exports = {
    initGravityWiz: (on, config, { activatePlugins }) => {
        if (!activatePlugins) {
            activatePlugins = [];
        }

        console.info('Initializing test run for Gravity Wiz...');

        console.info('Installing and activating Gravity Forms CLI...');
        execFileSync('wp', ['plugin', 'install', '--activate', 'gravityformscli'])

        console.info('Activating Gravity Forms and Perks...');
        execFileSync('wp', ['plugin', 'activate', 'gravityforms', 'gravityperks', ...activatePlugins])
    }
}