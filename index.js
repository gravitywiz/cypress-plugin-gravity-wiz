const execa = require('execa')
const { initPlugin: initSnapshots } = require('cypress-plugin-snapshots/plugin');
const path = require('path');
const fs = require('fs');
const os = require('os');

module.exports = {
    initGravityWiz: (on, config, opts = {}) => {
        const { activatePlugins } = opts
        // Copy GF_KEY into Cypress env
        config.env.gf_key = process.env.GF_KEY

        config.emailsFolder = path.resolve( os.tmpdir(), './gwiz-cypress-emails' );

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
            },
            addPlugin( { filename, contents } ) {
                let pluginPath = path.resolve( __dirname, '..' );
                const { stdout } = execa.sync( 'wp', ['plugin', 'path'] )

                if (stdout) {
                    pluginPath = stdout.trim();
                }

                const filePath = path.resolve( pluginPath, filename );
                
                fs.writeFileSync( filePath, contents );
                fs.chmodSync( filePath, 0o0755 );

                return null;
            },
            clearEmails() {
                if ( ! fs.existsSync( config.emailsFolder ) ) {
                    fs.mkdirSync( config.emailsFolder );
                }

                // Clear out emails
                const files = fs.readdirSync( config.emailsFolder );

                for ( const file of files ) {
                    fs.unlinkSync( path.join( config.emailsFolder, file ) );
                }

                fs.chmodSync( config.emailsFolder, 0o777 );

                return null;
            },

            listEmails() {
                return fs.readdirSync( config.emailsFolder )
                         .filter( ( name ) => name.indexOf( '.json' ) !== -1 )
                         .map( ( fileName ) => ( {
                             name: fileName,
                             time: fs.statSync( `${ config.emailsFolder }/${ fileName }` ).mtime.getTime(),
                         } ) )
                         .sort( ( a, b ) => a.time - b.time )
                         .map( ( file ) => file.name );
            },

            readEmail( emailFilename ) {
                return JSON.parse( fs.readFileSync( path.join( config.emailsFolder, emailFilename ) ).toString() );
            },

            async clearDebugLog() {
                const { stdout: logPath } = await execa( 'wp', [
                    'eval',
                    `echo WP_CONTENT_DIR . '/debug.log';`,
                ] );

                if ( fs.existsSync( logPath ) ) {
                    fs.rmSync( logPath );
                }

                return null;
            },
            async getDebugLog() {
                const { stdout: logPath } = await execa( 'wp', [
                    'eval',
                    `echo WP_CONTENT_DIR . '/debug.log';`,
                ] );

                if ( ! fs.existsSync( logPath ) ) {
                    return '';
                }

                return fs.readFileSync( logPath ).toString();
            },
        })

        console.info('Initializing test run for Gravity Wiz...');

        console.info('Enabling SCRIPT_DEBUG...');
        execa.sync('wp', ['config', 'set', 'SCRIPT_DEBUG', 'true', '--raw'])

        console.info('Installing and activating Gravity Forms CLI...');
        execa.sync('wp', ['plugin', 'install', '--activate', 'gravityformscli'])

        console.info('Activating Gravity Forms and Gravity Perks...');
        execa.sync('wp', ['plugin', 'activate', 'gravityforms', 'gravityperks'])

        if (activatePlugins && activatePlugins.length) {
            console.info('Activating the following plugins:', activatePlugins);
            execa.sync('wp', ['plugin', 'activate', ...activatePlugins])
        } else {
            throw new Error('No plugin names passed to opts.activatePlugins when calling initGravityWiz(on, config, opts). Do you need to activate the plugin that you are testing?');
        }

        initSnapshots(on, config);

        return config;
    }
}