import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@bysellens/frontend-core/api';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import { clave, leer } from '@bysellens/frontend-core/mock';
import {
  actualizarCliente, crearCliente, eliminarCliente, listarClientes,
  obtenerClientePorId, obtenerClientes, type ClienteRequest,
} from './clienteService';
import { mockClientes } from './mock';

const solicitud: ClienteRequest = {
  nombre: 'Demo', telefono: '300', email: 'demo@example.com', direccion: 'Calle 1', activo: true,
};
beforeEach(() => {
  localStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: 'http://localhost:8080', portal: 'customer' });
});
afterEach(() => vi.restoreAllMocks());

describe('Contrato MOCK de Customer', () => {
  // Caso CRUD trasladado de las pruebas originales del frontend.
  it('conserva clientes creados y editados y permite eliminarlos', async () => {
    const cliente = await mockClientes.guardar(solicitud);
    await mockClientes.guardar({ ...cliente, nombre: 'Editado' }, cliente.id);
    expect((await mockClientes.obtener(cliente.id)).nombre).toBe('Editado');
    await mockClientes.eliminar(cliente.id);
    expect(await mockClientes.listar()).toHaveLength(1);
  });
  it('consulta el cliente inicial y conserva el alias publico', async () => {
    expect(listarClientes).toBe(obtenerClientes);
    expect(await listarClientes()).toEqual([expect.objectContaining({ id: 1, nombre: 'Ana Demo' })]);
    expect(await obtenerClientePorId(1)).toEqual((await obtenerClientes())[0]);
  });
  it('persiste el CRUD con la clave compartida y conserva los otros catalogos', async () => {
    const originales = leer();
    const cliente = await crearCliente(solicitud);
    expect(cliente.id).toBe(2);
    expect(JSON.parse(localStorage.getItem(clave)!).clientes).toHaveLength(2);
    await actualizarCliente(cliente.id, { ...solicitud, nombre: 'Editado', activo: false });
    // Otro consumidor del mismo origen ve los cambios sin un segundo almacen.
    expect(leer().clientes.find(c => c.id === cliente.id)).toMatchObject({ nombre: 'Editado', activo: false });
    configurarFrontend({ modo: 'mock', apiBase: '', portal: 'customer' });
    expect((await obtenerClientePorId(cliente.id)).nombre).toBe('Editado');
    await eliminarCliente(cliente.id);
    expect(leer().clientes).toHaveLength(1);
    expect(leer().productos).toEqual(originales.productos);
    expect(leer().ventas).toEqual(originales.ventas);
    expect(clave).toBe('bysellens_mock_v1');
  });
  it('propaga el error original al consultar o editar un ID inexistente sin escribir datos', async () => {
    const esperado = { response: { data: { error: 'Registro no encontrado', mensaje: 'Registro no encontrado' } } };
    await expect(obtenerClientePorId(999)).rejects.toMatchObject(esperado);
    await expect(actualizarCliente(999, solicitud)).rejects.toMatchObject(esperado);
    expect(localStorage.getItem(clave)).toBeNull();
  });
  it('conserva la eliminacion fisica y la eliminacion inexistente sin error del MOCK original', async () => {
    await eliminarCliente(999);
    expect(await obtenerClientes()).toHaveLength(1);
    await eliminarCliente(1);
    expect(await obtenerClientes()).toEqual([]);
    await expect(obtenerClientePorId(1)).rejects.toThrow('Registro no encontrado');
  });
  it('ejecuta las operaciones MOCK sin llamadas HTTP', async () => {
    const get = vi.spyOn(api, 'get');
    const post = vi.spyOn(api, 'post');
    const put = vi.spyOn(api, 'put');
    const borrar = vi.spyOn(api, 'delete');
    await obtenerClientes();
    const cliente = await crearCliente(solicitud);
    await obtenerClientePorId(cliente.id);
    await actualizarCliente(cliente.id, solicitud);
    await eliminarCliente(cliente.id);
    for (const espia of [get, post, put, borrar]) expect(espia).not.toHaveBeenCalled();
  });
});

describe('Contrato REAL configurable de Customer, sin backend', () => {
  it('conserva endpoints, metodos, payloads y respuestas del servicio original', async () => {
    configurarFrontend({ modo: 'real', apiBase: 'http://api.example.com', portal: 'customer' });
    const cliente = { ...solicitud, id: 8 };
    const get = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: [cliente] }).mockResolvedValueOnce({ data: cliente });
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: cliente });
    const put = vi.spyOn(api, 'put').mockResolvedValue({ data: cliente });
    const borrar = vi.spyOn(api, 'delete').mockResolvedValue({});
    expect(await obtenerClientes()).toEqual([cliente]);
    expect(await obtenerClientePorId(8)).toEqual(cliente);
    expect(await crearCliente(solicitud)).toEqual(cliente);
    expect(await actualizarCliente(8, solicitud)).toEqual(cliente);
    await expect(eliminarCliente(8)).resolves.toBeUndefined();
    expect(get).toHaveBeenNthCalledWith(1, '/api/clientes');
    expect(get).toHaveBeenNthCalledWith(2, '/api/clientes/8');
    expect(post).toHaveBeenCalledWith('/api/clientes', solicitud);
    expect(put).toHaveBeenCalledWith('/api/clientes/8', solicitud);
    expect(borrar).toHaveBeenCalledWith('/api/clientes/8');
    expect(localStorage.getItem(clave)).toBeNull();
  });
  it('utiliza la URL configurada al enviar una solicitud REAL', async () => {
    configurarFrontend({ modo: 'real', apiBase: 'http://api.example.com', portal: 'customer' });
    const adapter = api.defaults.adapter;
    try {
      api.defaults.adapter = async config => {
        expect(config.baseURL).toBe('http://api.example.com');
        expect(config.url).toBe('/api/clientes');
        return { data: [], status: 200, statusText: 'OK', headers: {}, config };
      };
      expect(await obtenerClientes()).toEqual([]);
    } finally { api.defaults.adapter = adapter; }
  });
  it('propaga errores de validacion REAL sin reemplazar el contrato del servidor', async () => {
    configurarFrontend({ modo: 'real', apiBase: '', portal: 'customer' });
    const error = { response: { status: 400, data: { error: 'Validacion', errores: { nombre: 'Requerido' } } } };
    vi.spyOn(api, 'post').mockRejectedValue(error);
    await expect(crearCliente(solicitud)).rejects.toBe(error);
    expect(localStorage.getItem(clave)).toBeNull();
  });
});
