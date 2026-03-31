import { index, route, layout, prefix, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('login', 'routes/login.tsx'),
  layout('routes/dashboard-layout.tsx', [
    route('dashboard', 'routes/dashboard.tsx'),
    route('dashboard/settings', 'routes/dashboard.settings.tsx'),
    route('dashboard/users/:id', 'routes/dashboard.users.$id.tsx'),
  ]),
  ...prefix('admin', [
    route('users', 'routes/admin.users.tsx'),
    route('settings', 'routes/admin.settings.tsx'),
  ]),
  route('*', 'routes/catchall.tsx'),
] satisfies RouteConfig;
