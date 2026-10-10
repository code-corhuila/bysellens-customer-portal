import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { login } from '@bysellens/frontend-core/auth/authService';
import { inicial } from '@bysellens/frontend-core/mock';

beforeEach(() => configurarFrontend({ modo: 'mock', apiBase: '', portal: 'customer' }));
it('consume la autenticacion MOCK del paquete sin backend', async () => {
  const sesion = await login({ email: 'admin@bysellens.com', password: 'demo123' });
  expect(sesion.accessToken).toBe('mock-demo');
});
it('rechaza credenciales invalidas', async () => {
  await expect(login({ email: 'admin@bysellens.com', password: 'incorrecta' })).rejects.toThrow();
});
it('incluye los datos sinteticos compartidos', () => {
  expect(inicial().clientes[0].nombre).toBe('Ana Demo');
});
