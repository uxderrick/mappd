import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'

import Home from './pages/Home'
import Login from './pages/Login'
import DashboardLayout from './pages/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import UserDetail from './pages/UserDetail'
import AdminLayout from './pages/AdminLayout'
import AdminUsers from './pages/AdminUsers'
import ActivityFeed from './pages/ActivityFeed'
import NotFound from './pages/NotFound'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'users/:id', element: <UserDetail /> },
      { path: 'activity', element: <ActivityFeed /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <div style={{ padding: 32 }}>
        <h2>Admin Home</h2>
        <p className="muted">Welcome to the admin panel. Select a section from the sidebar.</p>
      </div> },
      { path: 'users', element: <AdminUsers /> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
