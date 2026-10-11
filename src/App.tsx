import React from 'react';
import Login from '@bysellens/frontend-core/auth/Login';
import PortalApp from '@bysellens/frontend-core/runtime/PortalApp';
import Clientes from './pages/Clientes';

const App: React.FC = () => <PortalApp pantalla={Clientes} inicioSesion={Login} />;
export default App;
