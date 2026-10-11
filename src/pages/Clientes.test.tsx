import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { listarClientes } from '../services/clienteService';
import Clientes from './Clientes';

vi.mock('../services/clienteService', () => ({ listarClientes: vi.fn() }));
const clientes = [
  { id: 1, nombre: 'Ana Demo', telefono: '3001234567', email: 'ana@example.com', direccion: 'Calle 10', activo: true },
  { id: 2, nombre: 'Luz Torres', telefono: '3019991000', email: 'luz@example.com', direccion: 'Carrera 20', activo: false },
];
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarClientes).mockResolvedValue(clientes);
});

it('consulta y muestra las seis columnas, el total, avatares y estados originales', async () => {
  render(<Clientes />);
  expect(await screen.findByText('Ana Demo')).toBeInTheDocument();
  expect(listarClientes).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole('columnheader').map(c => c.textContent)).toEqual([
    'ID', 'Cliente', 'Teléfono', 'Correo electrónico', 'Dirección', 'Estado',
  ]);
  expect(screen.getByText('2 clientes registrados')).toBeInTheDocument();
  expect(screen.getByText('Activo')).toHaveClass('active');
  expect(screen.getByText('Inactivo')).toHaveClass('inactive');
  expect(document.querySelector('.cliente-avatar')?.textContent?.trim()).toBe('A');
  expect(screen.queryByText('Editar')).not.toBeInTheDocument();
});

it.each([' ANA ', '300123', 'ANA@EXAMPLE.COM'])('conserva la busqueda por nombre, telefono o correo: %s', async consulta => {
  render(<Clientes />);
  await screen.findByText('Ana Demo');
  const entrada = screen.getByPlaceholderText('Buscar por nombre, teléfono o correo...');
  fireEvent.change(entrada, { target: { value: consulta } });
  expect(screen.getByText('Ana Demo')).toBeInTheDocument();
  expect(screen.queryByText('Luz Torres')).not.toBeInTheDocument();
  // El contador sigue mostrando el total registrado, como en el original.
  expect(screen.getByText('2 clientes registrados')).toBeInTheDocument();
  fireEvent.change(entrada, { target: { value: '' } });
  expect(screen.getByText('Luz Torres')).toBeInTheDocument();
});

it('muestra el estado vacio original sin coincidencias, sin modificar los datos', async () => {
  render(<Clientes />);
  await screen.findByText('Ana Demo');
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inexistente' } });
  expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
  expect(screen.getByText('Registra un cliente nuevo para comenzar.')).toBeInTheDocument();
  expect(listarClientes).toHaveBeenCalledTimes(1);
});

it('muestra cero clientes y el mensaje original cuando el servicio devuelve una lista vacia', async () => {
  vi.mocked(listarClientes).mockResolvedValue([]);
  render(<Clientes />);
  await waitFor(() => expect(listarClientes).toHaveBeenCalled());
  expect(screen.getByText('0 clientes registrados')).toBeInTheDocument();
  expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
});

it('conserva el manejo original de errores sin inventar un estado visual nuevo', async () => {
  const error = new Error('Sin conexion');
  vi.mocked(listarClientes).mockRejectedValue(error);
  const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(<Clientes />);
    await waitFor(() => expect(consola).toHaveBeenCalledWith('Error cargando clientes:', error));
    expect(screen.getByText('No se encontraron clientes')).toBeInTheDocument();
  } finally { consola.mockRestore(); }
});
