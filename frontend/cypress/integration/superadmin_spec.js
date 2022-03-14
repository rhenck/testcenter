describe('Superadmin Tests', () => {
  it('Should create a new admin with read-only privileges', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/r/admin-starter');
    });
    cy.contains('System-Admin')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/superadmin/users');
    });
    cy.get('button.mat-focus-indicator:nth-child(1)')
      .click()
      .get('.mat-dialog-content > p:nth-child(1) > mat-form-field')
      .type('newTest')
      .get('.mat-dialog-content > p:nth-child(3) > mat-form-field')
      .type('user123')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newTest')
      .click()
      .wait(1000);
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1)').eq(3)
      .click()
      .get('div.ng-star-inserted:nth-child(1) > button:nth-child(2)')
      .click()
      .get('.mat-tooltip-trigger')
      .eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('newTest')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/r/admin-starter');
    });
    cy.contains('Status: Angemeldet als "newTest"')
      .should('exist');
    cy.contains('ws 1')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/files');
    });
    cy.get('button.mat-focus-indicator:nth-child(2)')
      .should('be.disabled')
      .get('button.mat-tooltip-trigger:nth-child(1)')
      .should('be.disabled');
  });

  it('Should change the password of a existing user', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newTest')
      .click()
      .get('button.mat-focus-indicator:nth-child(3)')
      .click()
      .get('.mat-dialog-content > p:nth-child(3) > mat-form-field')
      .type('123user')
      .get('button.mat-primary > span:nth-child(1)')
      .click()
      .get('.mat-tooltip-trigger')
      .eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('newTest')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('123user');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('Status: Angemeldet als "newTest"')
      .should('exist');
  });

  it('Should change privileges of existing admin to read-write', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newTest')
      .click()
      .wait(500);
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1)').eq(4)
      .click()
      .get('div.ng-star-inserted:nth-child(1) > button:nth-child(2)')
      .click()
      .get('.mat-tooltip-trigger')
      .eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('newTest')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('123user');
    cy.contains('Weiter als Admin')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/r/admin-starter');
    });
    cy.contains('Status: Angemeldet als "newTest"')
      .should('exist');
    cy.contains('ws 1')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/files');
    });
    cy.get('button.mat-focus-indicator:nth-child(2)')
      .should('be.enabled')
      .get('button.mat-tooltip-trigger:nth-child(1)')
      .should('be.enabled')
      .get('.mat-tooltip-trigger')
      .eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should delete an admin by clicking on the name', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newTest')
      .click()
      .get('button.mat-focus-indicator:nth-child(2)').eq(0)
      .click()
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newTest')
      .should('not.exist')
      .get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should create new super admin', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.get('button.mat-focus-indicator:nth-child(1)')
      .click()
      .get('.mat-dialog-content > p:nth-child(1) > mat-form-field')
      .type('newSuper')
      .get('.mat-dialog-content > p:nth-child(3) > mat-form-field')
      .type('user123')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newSuper')
      .click();
    cy.get('button.mat-focus-indicator:nth-child(4)')
      .click()
      .get('button.mat-primary > span:nth-child(1)')
      .click()
      .wait(1000);
    cy.get('.mat-dialog-content > p:nth-child(2) > mat-form-field')
      .type('user123')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newSuper *');
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('newSuper')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('Verwaltung von Testinhalten')
      .should('exist');
    cy.contains('Verwaltung von Nutzerrechten und von grundsätzlichen Systemeinstellungen')
      .should('exist');
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should not change super admin status without correct password', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newSuper *')
      .click()
      .get('button.mat-focus-indicator:nth-child(4)')
      .click()
      .wait(1000);
    cy.get('button.mat-primary > span:nth-child(1)')
      .click()
      .wait(1000);
    cy.get('.mat-dialog-content > p:nth-child(2) > mat-form-field')
      .type('wrongPassword')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('Fehler: Für diese Funktion haben Sie keine Berechtigung.')
      .should('exist');
    cy.contains('Fehler: Für diese Funktion haben Sie keine Berechtigung.')
      .click();
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should change super admin status with correct password', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newSuper *')
      .click()
      .get('button.mat-focus-indicator:nth-child(4)')
      .click();
    cy.get('button.mat-primary > span:nth-child(1)')
      .click()
      .wait(1000);
    cy.get('.mat-dialog-content > p:nth-child(2) > mat-form-field')
      .type('user123')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newSuper')
      .should('exist');
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('newSuper')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('Verwaltung von Testinhalten')
      .should('exist');
    cy.contains('Verwaltung von Nutzerrechten und von grundsätzlichen Systemeinstellungen')
      .should('not.exist');
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should add a new workspace', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.get('a.mat-tab-link:nth-child(2)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/superadmin/workspaces');
    });
    cy.get('button.mat-focus-indicator:nth-child(1)')
      .click();
    cy.get('.mat-dialog-content > p:nth-child(1) >mat-form-field')
      .type('ws 2')
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('ws 2')
      .should('exist');
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should change users access rights on workspace tab', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.get('a.mat-tab-link:nth-child(2)')
      .click();
    cy.contains('ws 2')
      .click()
      .wait(500);
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1)').eq(6)
      .click();
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1)').eq(3)
      .click();
    cy.get('div.ng-star-inserted:nth-child(1) > button:nth-child(2)')
      .click();
    cy.contains('ws 1')
      .click();
    cy.contains('ws 2')
      .click()
      .get('mat-checkbox > label:nth-child(1) > span:nth-child(1) > input').eq(3)
      .should('be.checked');
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should delete a user with checkbox', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.contains('newSuper')
      .should('exist');
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1)').eq(1)
      .click();
    cy.get('mat-checkbox > label:nth-child(1) > span:nth-child(1) > input').eq(1)
      .should('be.checked');
    cy.get('button.mat-focus-indicator:nth-child(2)').eq(0)
      .click()
      .get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('newSuper')
      .should('not.exist')
      .get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should delete a workspace', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.get('a.mat-tab-link:nth-child(2)')
      .click();
    cy.contains('ws 2')
      .click();
    cy.get('button.mat-focus-indicator:nth-child(2)').eq(0)
      .click();
    cy.get('button.mat-primary > span:nth-child(1)')
      .click();
    cy.contains('ws 2')
      .should('not.exist');
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should go to System-Admin (management window)', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('System-Admin')
      .click();
    cy.get('a.mat-tab-link:nth-child(2)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/superadmin/workspaces');
    });
    cy.get('a.mat-tab-link:nth-child(3)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/superadmin/settings');
    });
    cy.get('a.mat-tab-link:nth-child(1)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/superadmin/users');
    });
    cy.get('.mat-tooltip-trigger').eq(0)
      .click();
    cy.contains('Neu anmelden')
      .click();
  });

  it('Should open workspace', () => {
    cy.visit('http://localhost:4200/#/login/');
    cy.get('mat-form-field.mat-form-field:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > input')
      .clear()
      .type('super')
      .get('mat-form-field.mat-form-field:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)')
      .type('user123');
    cy.contains('Weiter als Admin')
      .click();
    cy.contains('ws 1')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/files');
    });
    cy.get('a.mat-tab-link:nth-child(2)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/syscheck');
    });
    cy.get('a.mat-tab-link:nth-child(3)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/results');
    });
    cy.get('a.mat-tab-link:nth-child(1)')
      .click();
    cy.location().should(loc => {
      expect(loc.href).to.eq('http://localhost:4200/#/admin/1/files');
    });
  });
});
