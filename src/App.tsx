import React from 'react';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';

// La pantalla existente de Clientes se incorpora en un incremento posterior.
const ContenidoCustomer: React.FC = () => <div />;
const App: React.FC = () => <PortalApp pantalla={ContenidoCustomer} inicioSesion={Login} />;
export default App;
