import { leer, guardar, siguiente, buscar } from '@bysellens/frontend-core/mock';
import type { Cliente } from '@bysellens/frontend-core/modelos';
export const mockClientes = {
  listar: async () => leer().clientes,
  obtener: async (id: number) => buscar(leer().clientes, id),
  guardar: async (cliente: Omit<Cliente, 'id'>, id?: number) => {
    const datos = leer();
    const resultado = { ...cliente, id: id ?? siguiente(datos.clientes) };
    if (id !== undefined) Object.assign(buscar(datos.clientes, id), resultado);
    else datos.clientes.push(resultado);
    guardar(datos); return resultado;
  },
  eliminar: async (id: number) => { const datos = leer(); datos.clientes = datos.clientes.filter(c => c.id !== id); guardar(datos); },
};
