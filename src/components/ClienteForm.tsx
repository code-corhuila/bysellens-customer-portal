import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline, peopleOutline, personAddOutline, createOutline } from 'ionicons/icons';
import type { Cliente, ClienteRequest } from '../services/clienteService';
import './ClienteForm.css';

interface ClienteFormProps {
  cliente: Cliente | null;
  onGuardar: (datos: ClienteRequest) => void;
  onCancelar: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onGuardar, onCancelar }) => {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [activo, setActivo] = useState(true);
  const esEdicion = cliente !== null;

  useEffect(() => {
    setNombre(cliente?.nombre || '');
    setTelefono(cliente?.telefono || '');
    setCorreo(cliente?.email || '');
    setDireccion(cliente?.direccion || '');
    setActivo(cliente?.activo ?? true);
  }, [cliente]);

  const guardar = () => {
    const errores = [
      [!nombre.trim(), 'El nombre completo es obligatorio'],
      [!telefono.trim(), 'El teléfono es obligatorio'],
      [!correo.trim(), 'El correo electrónico es obligatorio'],
      [!direccion.trim(), 'La dirección es obligatoria'],
      [!correo.includes('@'), 'Ingresa un correo electrónico válido'],
    ] as const;
    const error = errores.find(([invalido]) => invalido);
    if (error) {
      alert(error[1]);
      return;
    }
    onGuardar({ nombre: nombre.trim(), telefono: telefono.trim(),
      email: correo.trim(), direccion: direccion.trim(), activo });
  };

  return (
    <div className="cliente-form">
      <div className="cliente-form-header">
        <div>
          <span className="cliente-form-eyebrow">PÉTALOS ADMIN</span>
          <h1>{esEdicion ? 'Editar cliente' : 'Nuevo cliente'}</h1>
          <p>{esEdicion ? 'Modifica la información del cliente.' : 'Registra un nuevo cliente en el sistema.'}</p>
        </div>
        <button type="button" className="cliente-close-button" onClick={onCancelar} aria-label="Cerrar">
          <IonIcon icon={closeOutline} />
        </button>
      </div>
      <div className="cliente-form-content">
        <section className="cliente-section">
          <div className="cliente-section-title">
            <div className="cliente-section-icon"><IonIcon icon={peopleOutline} /></div>
            <div>
              <h2>Información del cliente</h2>
              <p>Datos básicos para asociar el cliente con sus ventas.</p>
            </div>
          </div>
          <div className="cliente-fields">
            <div className="cliente-field cliente-field-full">
              <label>Nombre completo <span>*</span></label>
              <input type="text" value={nombre} placeholder="Ej. María López" onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="cliente-field">
              <label>Teléfono <span>*</span></label>
              <input type="tel" value={telefono} placeholder="Ej. 300 123 4567" onChange={e => setTelefono(e.target.value)} />
            </div>
            <div className="cliente-field">
              <label>Correo electrónico <span>*</span></label>
              <input type="email" value={correo} placeholder="Ej. cliente@gmail.com" onChange={e => setCorreo(e.target.value)} />
            </div>
            <div className="cliente-field cliente-field-full">
              <label>Dirección <span>*</span></label>
              <input type="text" value={direccion} placeholder="Ej. Calle 10 # 15-20" onChange={e => setDireccion(e.target.value)} />
            </div>
          </div>
        </section>
        <section className="cliente-section cliente-status-section">
          <div className="cliente-section-title">
            <div className="cliente-section-icon"><IonIcon icon={personAddOutline} /></div>
            <div>
              <h2>Estado del cliente</h2>
              <p>Define si el cliente está disponible para nuevas ventas.</p>
            </div>
          </div>
          <div className="cliente-status-card">
            <div><strong>Cliente activo</strong><span>Disponible para registrar ventas.</span></div>
            <button type="button" className={activo ? 'cliente-switch active' : 'cliente-switch'}
              onClick={() => setActivo(!activo)} aria-label="Cambiar estado del cliente"><span /></button>
          </div>
        </section>
      </div>
      <div className="cliente-form-footer">
        <button type="button" className="cliente-button cliente-button-secondary" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="cliente-button cliente-button-primary" onClick={guardar}>
          <IonIcon icon={esEdicion ? createOutline : personAddOutline} />
          {esEdicion ? 'Guardar cambios' : 'Registrar cliente'}
        </button>
      </div>
    </div>
  );
};

export default ClienteForm;
