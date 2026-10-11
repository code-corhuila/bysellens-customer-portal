describe('Consulta original de clientes', () => {
  beforeEach(() => {
    cy.visit('/clientes');
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('form').submit();
    cy.location('pathname').should('eq', '/clientes');
    cy.contains('tbody', 'Ana Demo').should('be.visible');
  });

  it('muestra datos MOCK, total, columnas y estado con los estilos originales', () => {
    cy.get('.clientes-card').should('have.css', 'border-radius', '20px');
    cy.get('.clientes-page').should('have.css', 'background-color', 'rgb(255, 248, 251)');
    cy.get('thead th').should('have.length', 6);
    cy.contains('1 cliente registrado').should('be.visible');
    cy.contains('tbody', '3001234567');
    cy.contains('tbody', 'ana@example.com');
    cy.contains('.cliente-badge.active', 'Activo');
    cy.screenshot('clientes-listado-escritorio');
  });

  it('busca por nombre, telefono y correo, limpia el filtro y muestra el vacio', () => {
    for (const consulta of [' ANA ', '300123', 'ANA@EXAMPLE.COM']) {
      cy.get('.clientes-search input').clear().type(consulta);
      cy.contains('tbody', 'Ana Demo').should('be.visible');
    }
    cy.get('.clientes-search input').clear().type('inexistente');
    cy.contains('No se encontraron clientes').should('be.visible');
    cy.contains('1 cliente registrado').should('be.visible');
    cy.get('.clientes-search input').clear();
    cy.contains('tbody', 'Ana Demo').should('be.visible');
    cy.reload();
    cy.contains('tbody', 'Ana Demo').should('be.visible');
  });

  it('mantiene el diseño movil y el scroll de tabla del original', () => {
    cy.viewport(390, 844);
    cy.get('.clientes-content').should('have.css', 'padding', '18px');
    cy.get('.clientes-card').should('have.css', 'border-radius', '15px');
    cy.get('.clientes-table-wrapper').should('have.css', 'overflow-x', 'auto');
    cy.get('.clientes-table').should('have.css', 'min-width', '900px');
    cy.contains('.cliente-name-cell strong', 'Ana Demo').scrollIntoView().should('be.visible');
    cy.screenshot('clientes-listado-movil');
  });
});
