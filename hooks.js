before(() => {
    /* returning false here prevents Cypress from failing the test */
    Cypress.on(
        'uncaught:exception',
        // @ts-ignore
        err => !err.message.includes('ResizeObserver loop limit exceeded'),
    )

    Cypress.on( 'uncaught:exception', ( err ) => {
        if (
            err.message.indexOf(
                "Cannot read properties of undefined (reading 'replace')"
            ) !== -1
        ) {
            return false;
        }
    } );
});

before( () => {
    cy.clearDebugLog();

    cy.bootstrap();
    cy.resetGF();
} );

after( () => {
    cy.get( '.xdebug-error' ).should( 'not.exist' );
    cy.contains( 'WordPress database error' ).should( 'not.exist' );

    // Only check debug log for GF 2.5 or newer
    cy.isGF25OrNewer().then((isGF25OrNewer) => {
        if (!isGF25OrNewer) {
            return;
        }

        cy.checkDebugLog();
    });
} );
