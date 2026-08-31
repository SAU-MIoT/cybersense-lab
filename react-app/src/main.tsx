import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './index.css';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const redirectParams = new URLSearchParams(window.location.search);
const redirectPath = redirectParams.get('p');

if (redirectPath) {
  const routePath = redirectPath.startsWith('/') ? redirectPath : `/${redirectPath}`;
  const query = redirectParams.get('q');
  window.history.replaceState(
    null,
    '',
    `${basePath}${routePath}${query ? `?${query}` : ''}${window.location.hash}`,
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basePath}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#0a1628', color: '#fff', border: '1px solid rgba(0,200,232,.3)' },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
