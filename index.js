const execa = require('execa')

module.exports = {
    initGravityWiz: (on, config, { activatePlugins }) => {
        // Copy GF_KEY into Cypress env
        config.env.gf_key = process.env.GF_KEY

        if (!activatePlugins) {
            activatePlugins = [];
        }

        on('task', {
            /**
             * execa is much more reliable cross-platform and allows running Cypress in either Cygwin or CMD on Windows
             *
             * @param command
             * @param args
             * @returns {execa.ExecaSyncReturnValue}
             */
            execa({ command, args }) {
                return execa.sync(command, args);
            }
        })

        console.info('Initializing test run for Gravity Wiz...');

        console.info('Installing and activating Gravity Forms CLI...');
        execa.sync('wp', ['plugin', 'install', '--activate', 'gravityformscli'])

        console.info('Activating Gravity Forms and Perks...');
        execa.sync('wp', ['plugin', 'activate', 'gravityforms', 'gravityperks', ...activatePlugins])

        return config;
    }
}