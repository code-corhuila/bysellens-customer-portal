import React from 'react';
import { expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '@bysellens/frontend-core/auth/AuthContext';
import { configurarFrontend } from '@bysellens/frontend-core/configuracion';
import App from './App';

// jsdom no reproduce las transiciones nativas del outlet; Cypress prueba el runtime real.
vi.mock('@ionic/react', async importar => {
  const ionic = await importar<typeof import('@ionic/react')>();
  const { Routes } = await import('react-router-dom');
  return { ...ionic, IonRouterOutlet: ({ children }: React.PropsWithChildren) => <Routes>{children}</Routes> };
});

it('protege Customer, inicia sesion y permite cerrarla con los componentes existentes', async () => {
  sessionStorage.clear();
  configurarFrontend({ modo: 'mock', apiBase: '', portal: 'customer' });
  window.history.replaceState({}, '', '/clientes');
  render(<AuthProvider><App /></AuthProvider>);
  const correo = await waitFor(() => {
    const entrada = document.querySelector('#email');
    expect(entrada).not.toBeNull();
    return entrada!;
  });
  fireEvent.change(correo, { target: { value: 'admin@bysellens.com' } });
  fireEvent.change(document.querySelector('#password')!, { target: { value: 'demo123' } });
  fireEvent.submit(document.querySelector('form')!);
  await waitFor(() => expect(sessionStorage.getItem('bysellens_access_token')).toBe('mock-demo'));
  fireEvent.click(await screen.findByText('Cerrar sesión'));
  await waitFor(() => expect(sessionStorage.getItem('bysellens_access_token')).toBeNull());
  await waitFor(() => expect(document.querySelector('#email')).not.toBeNull());
});
