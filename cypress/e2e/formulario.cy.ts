describe('Componente original de formulario, sin integracion de listado', () => {
  it('valida, completa y entrega los campos de registro', () => {
    cy.visit('http://localhost:5186/cypress/fixtures/formulario.html');
    const alerta = cy.stub();
    cy.on('window:alert', alerta);
    cy.contains('button', 'Registrar cliente').click();
    cy.then(() => expect(alerta).to.have.been.calledWith('El nombre completo es obligatorio'));
    cy.get('input').eq(0).type(' Maria ');
    cy.get('input').eq(1).type(' 300123 ');
    cy.get('input').eq(2).type(' maria@example.com ');
    cy.get('input').eq(3).type(' Calle 10 ');
    cy.contains('button', 'Registrar cliente').click();
    cy.get('body').should('have.attr', 'data-guardado', JSON.stringify({ nombre: 'Maria', telefono: '300123', email: 'maria@example.com', direccion: 'Calle 10', activo: true }));
    cy.get('.cliente-form-header h1').should('have.css', 'font-size', '38px');
    cy.screenshot('formulario-registro-escritorio');
  });

  it('conserva los datos de edicion, estado, cancelacion y estilos moviles', () => {
    cy.viewport(390, 844);
    cy.visit('http://localhost:5186/cypress/fixtures/formulario.html?editar');
    cy.contains('Editar cliente').should('be.visible');
    cy.get('input').eq(0).should('have.value', 'Ana Demo').clear().type('Ana Editada');
    cy.get('[aria-label="Cambiar estado del cliente"]').should('not.have.class', 'active').click();
    cy.contains('button', 'Guardar cambios').click();
    cy.get('body').should('have.attr', 'data-guardado', JSON.stringify({ nombre: 'Ana Editada', telefono: '3001234567', email: 'ana@example.com', direccion: 'Calle 10', activo: true }));
    cy.get('.cliente-form-header').should('have.css', 'padding', '22px 18px');
    cy.get('.cliente-fields').should('have.css', 'display', 'grid').and(entrada => {
      expect(getComputedStyle(entrada[0]).gridTemplateColumns.split(' ')).to.have.length(1);
    });
    cy.contains('button', 'Cancelar').click();
    cy.get('body').should('have.attr', 'data-cancelado', 'true');
    cy.screenshot('formulario-edicion-movil');
  });
});
