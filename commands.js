const shellescape = require('shell-escape');
const path = require('path');
const compareVersions = require('tiny-version-compare');

Cypress.Commands.add('login', () => {
    cy.visit('./wp-admin');

    cy.get('#user_login')
        .clear()
        .click()
        .type('admin')
        .should('have.value', 'admin');

    cy.get('#user_pass')
        .clear()
        .click()
        .type('admin')
        .should('have.value', 'admin');

    cy.get('form#loginform').submit()

    cy.contains('Dashboard')
    cy.contains('Howdy,')
})

Cypress.Commands.add('importForm', (jsonPath) => {
    if (path.basename(jsonPath) === jsonPath) {
        jsonPath = path.join(Cypress.config('fixturesFolder'), 'forms', jsonPath);
    }

    if (path.extname(jsonPath) === '') {
        jsonPath += '.json';
    }

    cy.exec(shellescape(['wp', 'eval-file', path.join(__dirname, './scripts/import-form.php'), jsonPath]))
        .its('stdout');
})

Cypress.Commands.add('bootstrap', () => {
    cy.exec(shellescape(['wp', 'eval-file', path.join(__dirname, './scripts/bootstrap.php')]));
})

Cypress.Commands.add('resetGF', () => {
    cy.exec(shellescape(['wp', 'eval-file', path.join(__dirname, './scripts/reset-gf.php')]));
})

Cypress.Commands.add('getGFVersion', () => {
    cy.exec(shellescape(['wp', 'gf', 'version'])).its('stdout')
})

Cypress.Commands.add('isGF25OrNewer', () => {
    return cy.getGFVersion().then((gfVersion) => {
       return cy.wrap(compareVersions('2.5-alpha', gfVersion) !== 1)
    });
})

Cypress.Commands.add('getFormID', (formTitle) => {
    cy.exec(shellescape(['wp', 'eval-file', path.join(__dirname, './scripts/get-form-id.php'), formTitle]))
        .its('stdout')
        .then((formID) => {
            cy.wrap(parseInt(formID))
                // Assert form found with provided title
                .should('be.gt', 0)

            return cy.wrap(parseInt(formID));
        })
});

Cypress.Commands.add('importEntries', (path) => {
    cy.exec(shellescape(['wp', 'gf', 'entry', 'import', path]));
})

Cypress.Commands.add('evalPhp', (php) => {
    cy.exec(shellescape(['wp', 'eval', php]));
})
