import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ClienteForm from './ClienteForm';

const cliente = { id: 7, nombre: 'Ana', telefono: '300123', email: 'ana@example.com', direccion: 'Calle 10', activo: false };
const campos = ['Ej. María López', 'Ej. 300 123 4567', 'Ej. cliente@gmail.com', 'Ej. Calle 10 # 15-20'];
const valores = [' María ', ' 301555 ', ' maria@example.com ', ' Carrera 20 '];
afterEach(() => vi.restoreAllMocks());

it.each([
  [0, 'El nombre completo es obligatorio'],
  [1, 'El teléfono es obligatorio'],
  [2, 'El correo electrónico es obligatorio'],
  [3, 'La dirección es obligatoria'],
  [4, 'Ingresa un correo electrónico válido'],
])('conserva la validacion original %s', (paso, mensaje) => {
  const guardar = vi.fn();
  const alerta = vi.spyOn(window, 'alert').mockImplementation(() => {});
  render(<ClienteForm cliente={null} onGuardar={guardar} onCancelar={vi.fn()} />);
  campos.forEach((campo, i) => fireEvent.change(screen.getByPlaceholderText(campo), {
    target: { value: paso === 4 && i === 2 ? 'invalido' : i < paso ? valores[i] : ' ' },
  }));
  fireEvent.click(screen.getByText('Registrar cliente'));
  expect(alerta).toHaveBeenCalledWith(mensaje);
  expect(guardar).not.toHaveBeenCalled();
});

it('entrega los campos recortados y el estado para registro', () => {
  const guardar = vi.fn();
  render(<ClienteForm cliente={null} onGuardar={guardar} onCancelar={vi.fn()} />);
  campos.forEach((campo, i) => fireEvent.change(screen.getByPlaceholderText(campo), { target: { value: valores[i] } }));
  fireEvent.click(screen.getByLabelText('Cambiar estado del cliente'));
  fireEvent.click(screen.getByText('Registrar cliente'));
  expect(guardar).toHaveBeenCalledWith({ nombre: 'María', telefono: '301555', email: 'maria@example.com', direccion: 'Carrera 20', activo: false });
});

it('carga los datos de edicion y los reinicia al volver a registro', () => {
  const guardar = vi.fn();
  const props = { onGuardar: guardar, onCancelar: vi.fn() };
  const vista = render(<ClienteForm cliente={cliente} {...props} />);
  expect(screen.getByText('Editar cliente')).toBeInTheDocument();
  expect(screen.getByPlaceholderText(campos[0])).toHaveValue('Ana');
  expect(screen.getByLabelText('Cambiar estado del cliente')).not.toHaveClass('active');
  fireEvent.change(screen.getByPlaceholderText(campos[0]), { target: { value: ' Ana Editada ' } });
  fireEvent.click(screen.getByText('Guardar cambios'));
  expect(guardar).toHaveBeenCalledWith({ nombre: 'Ana Editada', telefono: '300123', email: 'ana@example.com', direccion: 'Calle 10', activo: false });
  vista.rerender(<ClienteForm cliente={null} {...props} />);
  campos.forEach(campo => expect(screen.getByPlaceholderText(campo)).toHaveValue(''));
  expect(screen.getByLabelText('Cambiar estado del cliente')).toHaveClass('active');
});

it.each(['Cancelar', 'Cerrar'])('delega %s sin guardar', texto => {
  const cancelar = vi.fn(), guardar = vi.fn();
  render(<ClienteForm cliente={null} onGuardar={guardar} onCancelar={cancelar} />);
  fireEvent.click(screen.getByRole('button', { name: texto }));
  expect(cancelar).toHaveBeenCalledTimes(1);
  expect(guardar).not.toHaveBeenCalled();
});
