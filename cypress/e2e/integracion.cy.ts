describe('Integracion completa original de Customer', () => {
  beforeEach(() => {
    cy.visit('/clientes');
    cy.get('#email').type('admin@bysellens.com');
    cy.get('#password').type('demo123');
    cy.get('form').submit();
    cy.contains('tbody', 'Ana Demo').should('be.visible');
  });

  it('registra, persiste, busca, edita y elimina desde la interfaz', () => {
    const alertas = cy.stub();
    cy.on('window:alert', alertas);
    cy.get('.clientes-new-button').click();
    cy.contains('.cliente-form h1', 'Nuevo cliente').should('be.visible');
    cy.contains('button', 'Registrar cliente').click();
    cy.then(() => expect(alertas).to.have.been.calledWith('El nombre completo es obligatorio'));
    [' Maria Integral ', ' 3015551234 ', ' maria@example.com ', ' Carrera 20 '].forEach((dato, i) => {
      cy.get('.cliente-form input').eq(i).type(dato);
    });
    cy.get('.cliente-modal-panel').should('have.css', 'width', '620px');
    cy.screenshot('customer-panel-registro');
    cy.contains('button', 'Registrar cliente').click();
    cy.get('.cliente-modal-overlay').should('not.exist');
    cy.then(() => expect(alertas).to.have.been.calledWith('Cliente registrado correctamente'));
    cy.contains('tbody', 'Maria Integral').should('exist');
    cy.contains('2 clientes registrados').should('exist');
    cy.reload();
    cy.contains('tbody', 'Maria Integral').should('exist');
    cy.get('.clientes-search input').type(' MARIA@EXAMPLE.COM ');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('tr', 'Maria Integral').find('[title="Editar"]').scrollIntoView().click();
    cy.get('.cliente-form input').eq(0).should('have.value', 'Maria Integral').clear().type('Maria Editada');
    cy.get('.cliente-form input').eq(1).should('have.value', '3015551234');
    cy.get('.cliente-form input').eq(2).should('have.value', 'maria@example.com');
    cy.get('.cliente-form input').eq(3).should('have.value', 'Carrera 20');
    cy.get('[aria-label="Cambiar estado del cliente"]').click();
    cy.contains('button', 'Guardar cambios').click();
    cy.then(() => expect(alertas).to.have.been.calledWith('Cliente actualizado correctamente'));
    cy.contains('tr', 'Maria Editada').find('.cliente-badge.inactive').should('contain', 'Inactivo');
    cy.get('.clientes-search input').should('have.value', ' MARIA@EXAMPLE.COM ');
    cy.reload();
    cy.contains('tr', 'Maria Editada').find('.cliente-badge.inactive').should('exist');
    cy.on('window:confirm', () => true);
    cy.contains('tr', 'Maria Editada').find('[title="Eliminar"]').scrollIntoView().click();
    cy.contains('tbody', 'Maria Editada').should('not.exist');
    cy.reload();
    cy.contains('tbody', 'Maria Editada').should('not.exist');
    cy.contains('1 cliente registrado').should('exist');
  });

  it('conserva panel responsive, cierre, cancelacion y limpieza al cambiar de modo', () => {
    cy.viewport(390, 844);
    cy.contains('tr', 'Ana Demo').find('[title="Editar"]').scrollIntoView().click();
    cy.get('.cliente-modal-panel').should(panel => {
      expect(panel[0].getBoundingClientRect().width).to.eq(panel[0].parentElement!.clientWidth);
    });
    cy.get('.cliente-form input').eq(0).should('have.value', 'Ana Demo').clear().type('Sin guardar');
    cy.get('.cliente-form-header').should('have.css', 'padding', '22px 18px');
    cy.screenshot('customer-panel-edicion-movil');
    cy.contains('button', 'Cancelar').click();
    cy.get('.cliente-modal-overlay').should('not.exist');
    cy.get('.clientes-new-button').scrollIntoView().click();
    cy.get('.cliente-form input').each(entrada => cy.wrap(entrada).should('have.value', ''));
    cy.get('[aria-label="Cambiar estado del cliente"]').should('have.class', 'active');
    cy.get('[aria-label="Cerrar"]').click();
    cy.get('.cliente-modal-overlay').should('not.exist');
    cy.get('.clientes-new-button').click();
    cy.get('[aria-label="Cerrar formulario"]').click({ force: true });
    cy.get('.cliente-modal-overlay').should('not.exist');
    cy.reload();
    cy.contains('tbody', 'Ana Demo').should('exist');
    cy.contains('tbody', 'Sin guardar').should('not.exist');
  });
});
