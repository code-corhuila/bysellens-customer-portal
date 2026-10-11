import type { Cliente, ClienteRequest } from '@bysellens/frontend-core/modelos';
export type { Cliente, ClienteRequest } from '@bysellens/frontend-core/modelos';
import { modoMock } from '@bysellens/frontend-core/configuracion';
import { mockClientes } from './mock';
import api from '@bysellens/frontend-core/api';

const API_URL = '/api/clientes';

// =========================================================
// MODELO CLIENTE
// =========================================================



// =========================================================
// DATOS PARA CREAR / EDITAR
// =========================================================



// =========================================================
// LISTAR CLIENTES
// =========================================================

export const obtenerClientes = async (): Promise<Cliente[]> => {
  if (modoMock) return mockClientes.listar();
  const response = await api.get<Cliente[]>(API_URL);

  return response.data;
};

// Alias para mantener compatibilidad con Clientes.tsx

export const listarClientes = obtenerClientes;

// =========================================================
// OBTENER CLIENTE POR ID
// =========================================================

export const obtenerClientePorId = async (
  id: number
): Promise<Cliente> => {
  if (modoMock) return mockClientes.obtener(id);
  const response = await api.get<Cliente>(
    `${API_URL}/${id}`
  );

  return response.data;
};

// =========================================================
// CREAR CLIENTE
// =========================================================

export const crearCliente = async (
  cliente: ClienteRequest
): Promise<Cliente> => {
  if (modoMock) return mockClientes.guardar(cliente);
  const response = await api.post<Cliente>(
    API_URL,
    cliente
  );

  return response.data;
};

// =========================================================
// ACTUALIZAR CLIENTE
// =========================================================

export const actualizarCliente = async (
  id: number,
  cliente: ClienteRequest
): Promise<Cliente> => {
  if (modoMock) return mockClientes.guardar(cliente, id);
  const response = await api.put<Cliente>(
    `${API_URL}/${id}`,
    cliente
  );

  return response.data;
};

// =========================================================
// ELIMINAR CLIENTE
// =========================================================

export const eliminarCliente = async (
  id: number
): Promise<void> => {
  if (modoMock) return mockClientes.eliminar(id);
  await api.delete(`${API_URL}/${id}`);
};