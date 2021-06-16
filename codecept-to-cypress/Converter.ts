import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { snakeCase } from 'change-case';

export default class Converter {
    public codeceptionTestContents: string = '';
    public cypressTestContents: string = '';

    /* Template variables */
    public purpose: string = '';
    public suite: string;
    public test: string = 'FILL_ME_IN';

    constructor(public filePath: string) {
        this.suite = path.basename(this.filePath);

        this.readCodeceptionTestContents();
        this.capturePurpose();
        this.removeRetries();
        this.removeOpeningTag();
        this.remove$IInstantiation();
        this.convertWantTosToComments();
        this.convertMethods();
        this.fillCypressTemplate();
        this.createCypressSpec();
        this.copyFormExports();
        this.removeCodeceptionTest();
    }

    readCodeceptionTestContents() {
        console.debug('Reading Codeception test...');

        this.codeceptionTestContents = fs.readFileSync(this.filePath).toString();
    }

    capturePurpose() {
        console.debug('Finding "purpose" in the test by looking in comment or first wantTo');

        const headerCommentMatch = this.codeceptionTestContents.match(/^ \* Purpose: (.*)$/m)?.[1];
        const wantToMatch = this.codeceptionTestContents.match(/\$I->wantTo\(\s+?['"](.*?)['"]\s+?\)/)?.[1];

        if (headerCommentMatch) {
            this.purpose = headerCommentMatch;

            this.codeceptionTestContents = this.codeceptionTestContents
                .replace(/\/\*.*Purpose:.*\*\//s, '');
        } else {
            this.purpose = wantToMatch;

            // If purpose was pulled from the first wantTo, remove it.
            this.codeceptionTestContents = this.codeceptionTestContents
                .replace(/\$I->wantTo\(\s+?['"](.*?)['"]\s+?\);/, '');
        }
    }

    removeRetries() {
        console.debug('Removing retries...');

        const matches = this.codeceptionTestContents.matchAll(/\$I->(retry(\w+))\s*\(/mg);

        for (const match of matches) {
            const search = match[1];
            const replace = match[2].charAt(0).toLowerCase() + match[2].slice(1);

            this.codeceptionTestContents = this.codeceptionTestContents.replace(search, replace);
        }
    }

    removeOpeningTag() {
        console.debug('Removing opening PHP tag...');

        this.codeceptionTestContents = this.codeceptionTestContents
            .replace(/<\?(php)?/, '')
            .trim();
    }

    remove$IInstantiation() {
        console.debug('Removing $I instantiation...');

        this.codeceptionTestContents = this.codeceptionTestContents
            .replace(/\$I = new AcceptanceTester\(\s*\$scenario\s*\);/, '')
            .trim();
    }

    convertWantTosToComments() {
        console.debug('Converting remaining wantTos/amGoingTo to comments');

        const matches = this.codeceptionTestContents.matchAll(/\$I->(wantTo|amGoingTo)\(\s+?['"](.*?)['"]\s+?\);/g);

        for (const match of matches) {
            this.codeceptionTestContents = this.codeceptionTestContents
                .replace(match[0], `// ${match[2]}`);
        }
    }

    buildMethodPattern(method: string, args: number = 1) : RegExp {
        let argsMatchers = Array(args).fill(`['"](.*?)['"]`).join('\\s*,\\s*');

        return new RegExp(`\\$I->${method}\\(\\s*${argsMatchers}\\s*\\);`, 'g');
    }

    convertMethods() {
        const { buildMethodPattern: match } = this;

        const replacements: [RegExp, string][] = [
            [match('importForm'), `cy.importForm('$1')`],
            [match('loginAsAdmin', 0), `cy.login()`],
            [match('see'), `cy.see('$1')`],
            [match('amOnPage'), `cy.visit('$1')`],
            [match('seeInField', 2), `cy.get('$1').should('have.value', '$2')`],
            [match('fillField', 2), `cy.get('$1').fill('$2')`],
            [match('selectOption', 2), `cy.get('$1').select('$2')`],
            [match('seeOptionIsSelected', 2), `cy.get('$1').contains('option', '$2').should('be.selected')`],
            [match('seeCheckboxIsChecked', 2), `cy.get('$1').should('be.checked')`],
            [match('dontSeeCheckboxIsChecked', 2), `cy.get('$1').should('not.be.checked')`],
            [match('waitForElement'), `cy.get('$1').should('exist')`],
            [match('seeElementInDOM'), `cy.get('$1').should('exist')`],
            [match('seeElement'), `cy.get('$1').should('be.visible')`],
            [match('waitForElementVisible'), `cy.get('$1').should('be.visible')`],
            [match('clickFormButton'), `cy.get('$1').click()`],
            [match('click'), `cy.get('$1').click()`],
            [match('seeNumberOfElements', 2), `cy.get('$1').should('have.length', $2)`],
            [/\$I->pressKey\(\s*['"](.*?)['"]\s*,\s*\\Facebook\\WebDriver\\WebDriverKeys::TAB\s*\);/g, `// https://docs.cypress.io/api/commands/type#Typing-tab-key-does-not-work\ncy.get('$1').focus().blur()`]
        ];

        for ( const replacement of replacements ) {
            this.codeceptionTestContents = this.codeceptionTestContents
                .replaceAll(replacement[0], replacement[1]);
        }
    }

    fillCypressTemplate() {
        console.debug('Populating Cypress Handlebars template...');

        const template = Handlebars.compile(fs.readFileSync(path.resolve(__dirname, './template.js.hbs')).toString(), {
            noEscape: true,
        });

        this.cypressTestContents = template({
            suite: this.suite,
            purpose: this.purpose,
            test: this.test,
            testContents: this.codeceptionTestContents.replace(/^/gm, '\t\t'),
        });
    }

    createCypressSpec() {
        const ceptFilename = path.basename(this.filePath, '.php');
        const specFilename = snakeCase(ceptFilename.replace(/Cept$/, '')) + '.spec.js';
        const specPath = path.join(process.cwd(), 'cypress', 'integration', specFilename);

        console.debug(`Writing Cypress spec to ${specPath}...`);

        fs.writeFileSync(specPath, this.cypressTestContents);
    }

    copyFormExports() {
        const matches = this.codeceptionTestContents
            .matchAll(/cy\.importForm\(\s*['"](.*?)['"]\s*\)/g);

        for (const match of matches) {
            const exportFilename = match[1] + '.json';
            const codeceptFormsPath = path.resolve(path.dirname(this.filePath), '../_data', 'forms');
            const codeceptFormPath = path.join(codeceptFormsPath, exportFilename);

            console.debug(`Copying form export ${exportFilename}...`);

            fs.copyFileSync(codeceptFormPath, path.join(process.cwd(), 'cypress', 'fixtures', 'forms', exportFilename));

            console.debug(`Removing Codecept form export ${codeceptFormPath}...`);
            fs.unlinkSync(codeceptFormPath);
        }
    }

    removeCodeceptionTest() {
        console.debug(`Removing Codecept test ${this.filePath}...`);
        fs.unlinkSync(this.filePath);
    }
}