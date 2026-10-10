describe('Base independiente de Customer', () => {
  it('protege la ruta, conserva la sesion al recargar y cierra sesion', () => {
    cy.visit('/clientes');
    cy.location('pathname').should('eq', '/login');
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('form').submit();
    cy.location('pathname').should('eq', '/clientes');
    cy.contains('Cerrar sesión').should('be.visible');
    cy.reload();
    cy.contains('Cerrar sesión').click();
    cy.location('pathname').should('eq', '/login');
    cy.get('#email').should('be.visible');
    cy.window().its('sessionStorage').invoke('getItem', 'bysellens_access_token').should('be.null');
  });
});
