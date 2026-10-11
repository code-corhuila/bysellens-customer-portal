import { beforeEach, expect, it } from 'vitest';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { crearCliente, obtenerClientes } from './clienteService';
beforeEach(() => { localStorage.clear(); configurarFrontend({ modo: 'mock', apiBase: '', portal: 'customer' }); });
it('crea un cliente desde el adaptador autónomo sin backend', async () => {
  const cliente = await crearCliente({ nombre: 'Demo', telefono: '3001234567', email: 'demo@example.com', direccion: 'Calle 1', activo: true });
  expect((await obtenerClientes()).some(c => c.id === cliente.id)).toBe(true);
});
