import React from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { listarClientes, eliminarCliente, crearCliente, actualizarCliente } from '../services/clienteService';
import Clientes from './Clientes';

vi.mock('../services/clienteService', () => ({ listarClientes: vi.fn(), eliminarCliente: vi.fn(), crearCliente: vi.fn(), actualizarCliente: vi.fn() }));
const clientes = [
  { id: 1, nombre: 'Ana Demo', telefono: '3001234567', email: 'ana@example.com', direccion: 'Calle 10', activo: true },
  { id: 2, nombre: 'Luz Torres', telefono: '3019991000', email: 'luz@example.com', direccion: 'Carrera 20', activo: false },
];
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarClientes).mockResolvedValue(clientes);
});

it('consulta y muestra las siete columnas, el total, avatares y estados originales', async () => {
  render(<Clientes />);
  expect(await screen.findByText('Ana Demo')).toBeInTheDocument();
  expect(listarClientes).toHaveBeenCalledTimes(1);
  expect(screen.getAllByRole('columnheader').map(c => c.textContent)).toEqual([
    'ID', 'Cliente', 'Teléfono', 'Correo electrónico', 'Dirección', 'Estado', 'Acciones',
  ]);
  expect(screen.getByText('2 clientes registrados')).toBeInTheDocument();
  expect(screen.getByText('Activo')).toHaveClass('active');
  expect(screen.getByText('Inactivo')).toHaveClass('inactive');
  expect(document.querySelector('.cliente-avatar')?.textContent?.trim()).toBe('A');
  expect(screen.getAllByTitle('Editar')).toHaveLength(2);
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

it.each([false, true])('respeta la confirmacion de eliminar: %s', async confirmar => {
  const confirmacion = vi.spyOn(window, 'confirm').mockReturnValue(confirmar);
  vi.mocked(eliminarCliente).mockResolvedValue();
  try {
    render(<Clientes />);
    await screen.findByText('Ana Demo');
    vi.mocked(listarClientes).mockResolvedValue([clientes[1]]);
    fireEvent.click(screen.getAllByTitle('Eliminar')[0]);
    expect(confirmacion).toHaveBeenCalledWith('\u00bfDeseas eliminar al cliente "Ana Demo"?');
    if (confirmar) {
      await waitFor(() => expect(screen.queryByText('Ana Demo')).not.toBeInTheDocument());
      expect(eliminarCliente).toHaveBeenCalledWith(1);
      expect(screen.getByText('1 cliente registrado')).toBeInTheDocument();
    } else {
      expect(eliminarCliente).not.toHaveBeenCalled();
      expect(listarClientes).toHaveBeenCalledTimes(1);
    }
  } finally { confirmacion.mockRestore(); }
});

it('mantiene el listado y muestra el error original si falla eliminar', async () => {
  const error = new Error('Sin conexion');
  const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true);
  const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
  const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(eliminarCliente).mockRejectedValue(error);
  try {
    render(<Clientes />);
    await screen.findByText('Ana Demo');
    fireEvent.click(screen.getAllByTitle('Eliminar')[0]);
    await waitFor(() => expect(alerta).toHaveBeenCalledWith('No fue posible eliminar el cliente'));
    expect(consola).toHaveBeenCalledWith('Error eliminando cliente:', error);
    expect(screen.getByText('Ana Demo')).toBeInTheDocument();
    expect(listarClientes).toHaveBeenCalledTimes(1);
  } finally { confirmar.mockRestore(); alerta.mockRestore(); consola.mockRestore(); }
});
it.each([false, true])('guarda desde la pantalla en modo edicion: %s', async edicion => {
  const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
  const actualizado = { ...clientes[0], nombre: 'Ana Nueva' };
  vi.mocked(crearCliente).mockResolvedValue(actualizado);
  vi.mocked(actualizarCliente).mockResolvedValue(actualizado);
  try {
    render(<Clientes />);
    await screen.findByText('Ana Demo');
    fireEvent.click(edicion ? screen.getAllByTitle('Editar')[0] : screen.getByText('Nuevo cliente'));
    if (edicion) expect(screen.getByPlaceholderText('Ej. María López')).toHaveValue('Ana Demo');
    const campos = ['Ej. María López', 'Ej. 300 123 4567', 'Ej. cliente@gmail.com', 'Ej. Calle 10 # 15-20'];
    ['Ana Nueva', '3001234567', 'ana@example.com', 'Calle 10'].forEach((value, i) => {
      fireEvent.change(screen.getByPlaceholderText(campos[i]), { target: { value } });
    });
    vi.mocked(listarClientes).mockResolvedValue([actualizado]);
    fireEvent.click(screen.getByText(edicion ? 'Guardar cambios' : 'Registrar cliente'));
    expect(await screen.findByText('Ana Nueva')).toBeInTheDocument();
    expect(screen.queryByLabelText('Cerrar formulario')).not.toBeInTheDocument();
    expect(alerta).toHaveBeenCalledWith(edicion ? 'Cliente actualizado correctamente' : 'Cliente registrado correctamente');
    const datos = { nombre: 'Ana Nueva', telefono: '3001234567', email: 'ana@example.com', direccion: 'Calle 10', activo: true };
    if (edicion) expect(actualizarCliente).toHaveBeenCalledWith(1, datos);
    else expect(crearCliente).toHaveBeenCalledWith(datos);
  } finally { alerta.mockRestore(); }
});

it.each([false, true])('conserva formulario y datos si falla el guardado; edicion: %s', async edicion => {
  const error = new Error('Sin conexion');
  const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
  const consola = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(crearCliente).mockRejectedValue(error);
  vi.mocked(actualizarCliente).mockRejectedValue(error);
  try {
    render(<Clientes />);
    await screen.findByText('Ana Demo');
    fireEvent.click(edicion ? screen.getAllByTitle('Editar')[0] : screen.getByText('Nuevo cliente'));
    ['Ej. María López', 'Ej. 300 123 4567', 'Ej. cliente@gmail.com', 'Ej. Calle 10 # 15-20'].forEach((campo, i) => {
      fireEvent.change(screen.getByPlaceholderText(campo), { target: { value: ['Ana', '300', 'a@b', 'Calle'][i] } });
    });
    fireEvent.click(screen.getByText(edicion ? 'Guardar cambios' : 'Registrar cliente'));
    await waitFor(() => expect(alerta).toHaveBeenCalledWith('No fue posible guardar el cliente'));
    expect(consola).toHaveBeenCalledWith('Error guardando cliente:', error);
    expect(screen.getByPlaceholderText('Ej. María López')).toHaveValue('Ana');
    expect(listarClientes).toHaveBeenCalledTimes(1);
  } finally { alerta.mockRestore(); consola.mockRestore(); }
});

it.each(['Cancelar', 'Cerrar', 'Cerrar formulario'])('cierra con %s y abre un registro limpio', async control => {
  render(<Clientes />);
  await screen.findByText('Ana Demo');
  fireEvent.click(screen.getAllByTitle('Editar')[0]);
  fireEvent.click(screen.getByRole('button', { name: control }));
  expect(screen.queryByLabelText('Cerrar formulario')).not.toBeInTheDocument();
  fireEvent.click(screen.getByText('Nuevo cliente'));
  expect(screen.getByPlaceholderText('Ej. María López')).toHaveValue('');
  expect(screen.getByLabelText('Cambiar estado del cliente')).toHaveClass('active');
});
