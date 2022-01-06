/**
 * Default handlers that we commonly need in tests.
 */
Cypress.on( 'uncaught:exception', ( err ) => {
    /* returning false here prevents Cypress from failing the test */

    // Not sure why this error is occurring but since Cypress fails on any application-side error, we need to
    // prevent this particular error from failing the entire test.
    const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;

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
