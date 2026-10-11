import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { peopleOutline, searchOutline, trashOutline, personAddOutline, createOutline } from 'ionicons/icons';
import { listarClientes, eliminarCliente, crearCliente, actualizarCliente, type ClienteRequest, type Cliente } from '../services/clienteService';
import ClienteForm from '../components/ClienteForm';
import './Clientes.css';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const cargarClientes = async () => {
    try {
      const respuesta = await listarClientes();
      setClientes(respuesta);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  useEffect(() => { cargarClientes(); }, []);

  const abrirNuevoCliente = () => {
    setClienteSeleccionado(null);
    setMostrarFormulario(true);
  };

  const abrirEditarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setClienteSeleccionado(null);
  };

  const guardarCliente = async (datos: ClienteRequest) => {
    try {
      if (clienteSeleccionado) {
        await actualizarCliente(clienteSeleccionado.id, datos);
        alert('Cliente actualizado correctamente');
      } else {
        await crearCliente(datos);
        alert('Cliente registrado correctamente');
      }
      cerrarFormulario();
      cargarClientes();
    } catch (error) {
      console.error('Error guardando cliente:', error);
      alert('No fue posible guardar el cliente');
    }
  };

  const borrarCliente = async (cliente: Cliente) => {
    const confirmar = window.confirm(`¿Deseas eliminar al cliente "${cliente.nombre}"?`);
    if (!confirmar) return;
    try {
      await eliminarCliente(cliente.id);
      cargarClientes();
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('No fue posible eliminar el cliente');
    }
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const texto = busqueda.toLowerCase().trim();
    return (
      cliente.nombre?.toLowerCase().includes(texto) ||
      cliente.telefono?.toLowerCase().includes(texto) ||
      cliente.email?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="clientes-page">
      <header className="clientes-header">
        <div>
          <span className="clientes-eyebrow">PÉTALOS ADMIN</span>
          <h1>Clientes</h1>
          <p>Registra y administra la información de tus clientes.</p>
        </div>
        <button className="clientes-new-button" onClick={abrirNuevoCliente}>
          <IonIcon icon={personAddOutline} />
          Nuevo cliente
        </button>
      </header>
      <main className="clientes-content">
        <section className="clientes-card">
          <div className="clientes-card-header">
            <div>
              <h2>Gestión de clientes</h2>
              <span>
                {clientes.length}{' '}
                {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
              </span>
            </div>
          </div>
          <div className="clientes-search">
            <IonIcon icon={searchOutline} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o correo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="clientes-table-wrapper">
            <table className="clientes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Correo electrónico</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length > 0 ? clientesFiltrados.map(cliente => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>
                      <div className="cliente-name-cell">
                        <div className="cliente-avatar">
                          {cliente.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <strong>{cliente.nombre}</strong>
                      </div>
                    </td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.email}</td>
                    <td>{cliente.direccion}</td>
                    <td>
                      <span className={cliente.activo ? 'cliente-badge active' : 'cliente-badge inactive'}>
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="cliente-actions">
                        <button className="cliente-action edit" onClick={() => abrirEditarCliente(cliente)} title="Editar">
                          <IonIcon icon={createOutline} />
                          Editar
                        </button>
                        <button className="cliente-action delete" onClick={() => borrarCliente(cliente)} title="Eliminar">
                          <IonIcon icon={trashOutline} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="clientes-empty">
                      <div className="clientes-empty-icon"><IonIcon icon={peopleOutline} /></div>
                      <strong>No se encontraron clientes</strong>
                      <span>Registra un cliente nuevo para comenzar.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {mostrarFormulario && (
        <div className="cliente-modal-overlay">
          <button className="cliente-modal-backdrop" onClick={cerrarFormulario} aria-label="Cerrar formulario" />
          <aside className="cliente-modal-panel">
            <ClienteForm cliente={clienteSeleccionado} onGuardar={guardarCliente} onCancelar={cerrarFormulario} />
          </aside>
        </div>
      )}
    </div>
  );
};

export default Clientes;
