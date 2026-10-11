// Entorno exclusivo de pruebas: no se importa desde la aplicación.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import ClienteForm from '../../src/components/ClienteForm';
import '../../src/pages/Clientes.css';
setupIonicReact();
const cliente = new URLSearchParams(location.search).has('editar')
  ? { id: 1, nombre: 'Ana Demo', telefono: '3001234567', email: 'ana@example.com', direccion: 'Calle 10', activo: false }
  : null;
createRoot(document.getElementById('root')!).render(React.createElement(ClienteForm, {
  cliente,
  onGuardar: datos => { document.body.dataset.guardado = JSON.stringify(datos); },
  onCancelar: () => { document.body.dataset.cancelado = 'true'; },
}));
