describe('Eliminacion original de clientes MOCK', () => {
  beforeEach(() => {
    cy.visit('/clientes');
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('form').submit();
    cy.contains('tbody', 'Ana Demo').should('be.visible');
  });

  it('cancela sin modificar el cliente ni la persistencia', () => {
    cy.on('window:confirm', () => false);
    cy.contains('tr', 'Ana Demo').find('[title="Eliminar"]').scrollIntoView().click();
    cy.contains('tbody', 'Ana Demo').should('exist');
    cy.reload();
    cy.contains('tbody', 'Ana Demo').should('exist');
  });

  it('elimina, actualiza el total y persiste al recargar sin backend', () => {
    const confirmar = cy.stub().returns(true);
    cy.on('window:confirm', confirmar);
    cy.contains('tr', 'Ana Demo').find('[title="Eliminar"]').scrollIntoView().click();
    cy.then(() => expect(confirmar).to.have.been.calledWith('\u00bfDeseas eliminar al cliente "Ana Demo"?'));
    cy.contains('No se encontraron clientes').should('be.visible');
    cy.contains('0 clientes registrados').should('be.visible');
    cy.reload();
    cy.contains('0 clientes registrados').should('be.visible');
    cy.contains('No se encontraron clientes').should('be.visible');
    cy.screenshot('clientes-eliminado');
  });
});