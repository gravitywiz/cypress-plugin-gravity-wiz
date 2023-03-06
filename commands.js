const path = require('path');
const compareVersions = require('tiny-version-compare');

import 'cypress-plugin-snapshots/commands';

/**
 * Prepare path for WP-CLI
 *
 * @param  {...string} pathParts
 */
const preparePath = (...pathParts) => {
    const joinedPath = path.join(...pathParts);

    if (Cypress.platform === 'win32') {
        return joinedPath.replace(/\/+/g, '\\');
    }

    return joinedPath;
};

Cypress.Commands.add('login', ({ username, password, logOut } = { username: 'admin', password: 'admin', logOut: false }) => {
    if (logOut) {
        cy.visit('/wp-login.php?action=logout', { failOnStatusCode: false });
        cy.contains('a', 'log out').should('be.visible').click();
    } else {
        cy.visit('./wp-admin');
    }

    cy.get('#user_login')
        .clear()
        .click()
        .type(username)
        .should('have.value', username);

    cy.get('#user_pass')
        .clear()
        .click()
        .type(password)
        .should('have.value', password);

    cy.get('form#loginform').submit()

    cy.see('Dashboard')
    cy.see('Howdy,')
})

Cypress.Commands.add('logout', () => {
    cy.visit('/wp-login.php?action=logout', { failOnStatusCode: false });
    cy.contains('a', 'log out').should('be.visible').click();
});

/* Inspired by Codeception */
Cypress.Commands.add('see', (string, selector, containsSettings = { matchCase: false }) => {
    cy.contains( selector, string, containsSettings ).should('be.visible');
})

/* Inspired by Codeception */
Cypress.Commands.add('fill', {
    prevSubject: true,
}, (subject, text) => {
    cy.wrap(subject)
        .should('be.visible')
        .clear()
        .type(text)
        .should('have.value', text);
})

Cypress.Commands.add('importForm', (jsonPath, formTitle) => {
    if (path.basename(jsonPath) === jsonPath) {
        jsonPath = path.join(Cypress.config('fixturesFolder'), 'forms', jsonPath);
    }

    if (path.extname(jsonPath) === '') {
        jsonPath += '.json';
    }

    const args = ['eval-file', preparePath(__dirname, 'scripts', 'import-form.php'), jsonPath];

    if (formTitle) {
        args.push(formTitle);
    }

    cy.execa('wp', args)
        .its('stdout');
})

Cypress.Commands.add('execa', (command, args) => {
    cy.task('execa', { command, args })
})

Cypress.Commands.overwrite('exec', () => {
    // execa offers much better cross-platform compatibility
    cy.wrap('Use the execa custom command rather than exec').should('be.false');
})

Cypress.Commands.add('bootstrap', () => {
    cy.execa('wp', ['eval-file', preparePath(__dirname, 'scripts', 'bootstrap.php')]);
})

Cypress.Commands.add('resetGF', () => {
    cy.execa('wp', ['eval-file', preparePath(__dirname, 'scripts', 'reset-gf.php')]);
})

Cypress.Commands.add('getGFVersion', () => {
    cy.execa('wp', ['gf', 'version']).its('stdout')
})

Cypress.Commands.add('isGF25OrNewer', () => {
    return cy.getGFVersion().then((gfVersion) => {
        return cy.wrap(compareVersions('2.5-alpha', gfVersion) !== 1)
    });
})

Cypress.Commands.add('getFormID', (formTitle) => {
    cy.execa('wp', ['eval-file', preparePath(__dirname, 'scripts', 'get-form-id.php'), formTitle])
        .its('stdout')
        .then((formID) => {
            cy.wrap(parseInt(formID))
                // Assert form found with provided title
                .should('be.gt', 0)

            return cy.wrap(parseInt(formID));
        })
});

Cypress.Commands.add('importEntries', (formID, jsonPath) => {
    if (path.basename(jsonPath) === jsonPath) {
        jsonPath = path.join(Cypress.config('fixturesFolder'), 'entries', jsonPath);
    }

    if (path.extname(jsonPath) === '') {
        jsonPath += '.json';
    }

    cy.execa('wp', ['gf', 'entry', 'import', formID, jsonPath]);
})

Cypress.Commands.add('evalPhp', (php) => {
    cy.execa('wp', ['eval', php]);
})

/**
 * Custom commands for serializing elements into an array of objects containing the element values and labels and then
 * comparing them against another selector.
 *
 * This is useful for comparing the order of inputs/options in fields.
 */
const toValuesAndLabels = (elements, trim) => {
    return elements.map(function (index, element) {
        const { $ } = Cypress;

        let value = $(element).val();
        let label = $(element).text();

        if (trim) {
            value = value.trim();
            label = label.trim();
        }

        return {
            value,
            label,
        }
    }).get();
};

Cypress.Commands.add('toValuesAndLabels', { prevSubject: true }, (subject, trim) => {
    return cy.wrap(toValuesAndLabels(subject, trim));
});

Cypress.Commands.add('matchesOtherInputs', { prevSubject: true }, (subject, otherSelector) => {
    return cy.wrap(subject).toValuesAndLabels()
        .should('deep.equal', toValuesAndLabels(Cypress.$(otherSelector)));
});

Cypress.Commands.add('doesNotMatchOtherInputs', { prevSubject: true }, (subject, otherSelector) => {
    return cy.wrap(subject).toValuesAndLabels()
        .should('not.deep.equal', toValuesAndLabels(Cypress.$(otherSelector)));
});

Cypress.Commands.add('goToChoicesSettings', () => {
    cy.getGFVersion().then((gfVersion) => {
        if (compareVersions('2.5-alpha', gfVersion) !== 1) {
            cy.get('#general_tab_toggle').scrollIntoView().click()

            if (compareVersions('2.6-alpha', gfVersion) !== 1) {
                cy.get('button.choices-ui__trigger').click()
                cy.get('.gform-flyout__title').should('be.visible')
            }
        } else {
            cy.get('[href="#gform_tab_1"]').scrollIntoView().click()
        }
    });
})

Cypress.Commands.add( 'clearDebugLog', () => {
    cy.task( 'clearDebugLog' );
} );

Cypress.Commands.add( 'checkDebugLog', () => {
    cy.task( 'getDebugLog' ).then( ( log ) => {
        // Fail if there are warnings or fatal errors
        const regex = /\[\d+-\S+-\d{4} \d{2}:\d{2}:\d{2} UTC] (PHP Fatal error|PHP Warning): ([\s\S]+?)\[\d+-\S+-\d{4} \d{2}:\d{2}:\d{2} UTC]/g;
        let m;
        const errors = [];

        while ( ( m = regex.exec( log ) ) !== null ) {
            // This is necessary to avoid infinite loops with zero-width matches
            if ( m.index === regex.lastIndex ) {
                regex.lastIndex++;
            }

            errors.push( m[ 1 ] + ': ' + m[ 2 ] );
        }

        if ( errors.length ) {
            throw new Error( errors.join( '\n\n' ) );
        }
    } );
} );
