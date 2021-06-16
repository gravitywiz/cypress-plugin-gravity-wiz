This script will do the heavy lifting of converting Codeception
Cept's to Cypress specs.

# Installation

1. Check `cypress-plugin-gravity-wiz` repository out if it isn't already
2. `cd` into `codecept-to-cypress`
2. Run `yarn install`
3. Run `npm install -g ts-node` if you don't already have TS Node installed
4. Run `npm link` to make `codecept-to-cypress` an available command
   
# Usage

1. `cd` into Perk directory
2. Run `codecept-to-cypress [PATH_TO_CEPT]`
   
   Example:

    ```shell
    codecept-to-cypress tests/codeception/acceptance/AdvancedLiveMergeTagsCept.php
    ```
3. Review new test (along with any copied form exports) created in `cypress/` directory
    *  Update `describe` and `it` accordingly

# Limitations

* Inline PHP code in the Cept will simply be copied in.
  It is up to you to decide how to best handle migrating it. 
  
  _Tip: [`cypress-plugin-gravity-wiz`](https://github.com/gravitywiz/cypress-plugin-gravity-wiz/blob/main/commands.js) has a handful of commands like `cy.execPhp` and `cy.execa` that may be a good fit._
* Some commands may simply not be accounted for. Consult the [Cypress Docs](https://docs.cypress.io/) to find a replacement when necessary.
* Entry exports are not handled