import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: 'settings', element: <Settings /> },
      { path: 'users/:id', lazy: () => import('./pages/UserDetail') },
      {
        path: 'analytics',
        lazy: () => import('./pages/Analytics').then((m) => ({ Component: m.default })),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
