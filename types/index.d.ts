
declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
        * Logs into WordPress using the login form.
        */
        login: (args: { username: 'string', password: string, logOut?: boolean }) => Chainable<Subject>

        /**
        * Command inspired by Codeception to check if a string is visible on the current page.
        * 
        * @param {string} string The string/text to check for on the page.
        * @param {string} selector Optionally scope the search to a specific CSS selector.
        * @param containsSettings Settings to be passed to cy.contains().
        * 
        * @see https://on.cypress.io/contains
        */
        see: (string: string, selector?: string, containsSettings?: { matchCase: boolean }) => Chainable<Subject>

        /**
        * Command inspired by Codeception to fill an input.
        * 
        * @param {string} text Text to fill the input with.
        */
        fill: (text: string) => Chainable<Subject>

        /**
        * Imports the given Gravity Form export.
        * 
        * A WordPress page with the a slug that matches the filename (excluding extension) will be created that contains a Gravity Forms
        * shortcode to display the form.
        *
        * @param {string} filename The form export to import from the fixtures folder. This should match the filename exluding ".json"
        * @example
        *    cy.importForm('kitchen-sink')
        *    cy.visit('/kitchen-sink')
        */
        importForm: (filename: string) => Chainable<Subject>
    }
}