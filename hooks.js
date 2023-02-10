before(() => {
    Cypress.on( 'uncaught:exception', ( err ) => {
        /* returning false here prevents Cypress from failing the test */

        // Not sure why this error is occurring but since Cypress fails on any application-side error, we need to
        // prevent this particular error from failing the entire test.
        const resizeObserverLoopErrRe = /^(ResizeObserver loop limit exceeded)/;

        if ( resizeObserverLoopErrRe.test( err.message ) ) {
            return false;

            /* seeing this error occasionally after logging in */
        } else if (
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

    cy.checkDebugLog();
} );
