declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
        * Logs into WordPress using the login form.
        */
        login: (args?: { username: string, password: string, logOut?: boolean }) => Chainable<Subject>

        /**
         * Logs the current user out of WordPress.
         */
        logout: () => Chainable<Subject>

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
        * @param {string} filename The form export to import from the fixtures folder. This should match the filename excluding ".json"
        * @example
        *    cy.importForm('kitchen-sink')
        *    cy.visit('/kitchen-sink')
        */
        importForm: (filename: string, formTitle?: string) => Chainable<Subject>

        /**
         * Executes the command using `execa`. Useful for running WP-CLI commands.
         *
         * @param {string} command The base command/filename to execute. Example: `wp`
         * @param {(string|number)[]} args Arguments to pass to the command.
         * @example
         *    cy.execa('wp', ['transient', 'delete', 'example_transient'])
         */
        execa: (command: string, args?: (string|number)[]) => Chainable<{
            exitCode: number,
            stdout: string,
            stderr: string
        }>

        /**
         * Prepares the WordPress site for testing. Handles various tasks such as resetting
         * WordPress posts, flushing rewrite rules, adding the "Cypress Test Helpers" MU plugin,
         * resets the admin password, dismisses welcome pointers, and so on.
         *
         * Additional actions can be ran in the bootstrap by adding an MU plugin and adding
         * an action to `gwiz_acceptance_test_bootstrap`.
         */
        bootstrap: () => Chainable<Subject>

        /**
         * Prepares Gravity Forms for testing by wiping all of its MySQL tables and running
         * its install scripts. It also clears the gf_updated transient to prevent upgrade
         * modals from showing.
         */
        resetGF: () => Chainable<Subject>

        /**
         * Gets the current Gravity Forms version.
         */
        getGFVersion: () => Chainable<string>

        /**
         * Checks if the current Gravity Forms is version 2.5 or higher.
         */
        isGF25OrNewer: () => Chainable<boolean>

        /**
         * Gets the form ID of the provided form title.
         *
         * @param {string} formTitle The form title to get the form ID of.
         *
         * @example
         *   cy.getFormID('[parent] Create Form Entry').then((formID) => {
         * 	     // Navigate to the Entries page of the child form.
         * 	     cy.visit(`/wp-admin/admin.php?page=gf_edit_forms&id=${formID}`);
         * 	 });
         */
        getFormID: (formTitle: string) => Chainable<number>

        /**
         * Imports the given Gravity Form entries export.
         *
         * @param {number} formID The form ID to import the entries into.
         * @param {string} jsonPath The entries export to import from the fixtures folder. This should match the filename excluding ".json"
         */
        importEntries: (formID: number, jsonPath: string) => Chainable<Subject>

        /**
         * Evaluates the string of PHP using WP-CLI.
         *
         * @param {string} php PHP string to eval.
         */
        evalPhp: (php: string) => Chainable<{
            exitCode: number,
            stdout: string,
            stderr: string
        }>

        /**
         * Extracts the value and label (inner text) of the array of elements.
         *
         * @param {boolean} trim Whether or not to run .trim() on the value and label.
         *
         * @example
         *   cy.get('#input_1_2 option').toValuesAndLabels().should('deep.equal', [
         *       {"value": "1", "label": "Hello world! (1 item remaining)"},
         *       {"value": "2", "label": "twentytwentytwo (2 items remaining)"},
         *   ])
         */
        toValuesAndLabels: (trim?: boolean) => Chainable<{ value: string, label: string }[]>

        /**
         * Checks if the given array of element's values/labels matches another selector.
         *
         * @param {string} otherSelector Other selector of elements to compare against.
         *
         * @example
         *   cy.get('#input_1_1 option')
         *     .matchesOtherInputs('#input_1_2 option');
         */
        matchesOtherInputs: () => Chainable<boolean>

        /**
         * Checks if the given array of element's values/labels DOES NOT match another selector.
         *
         * @param {string} otherSelector Other selector of elements to compare against.
         *
         * @example
         *   cy.get('#input_1_1 option')
         *     .doesNotMatchOtherInputs('#input_1_2 option');
         */
        doesNotMatchOtherInputs: () => Chainable<boolean>

        /**
         * Navigates to the Choices settings for the current field.
         */
        goToChoicesSettings: () => Chainable<Subject>
    }
}