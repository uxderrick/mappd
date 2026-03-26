import { MarkerType, type Node, type Edge } from '@xyflow/react';
import type { ScreenNodeData } from '../types';

export const initialNodes: Node<ScreenNodeData>[] = [
  {
    id: 'landing',
    type: 'screenNode',
    position: { x: 0, y: 300 },
    dragHandle: '.drag-handle',
    data: {
      routePath: '/',
      componentName: 'LandingPage',
      iframeSrc: 'http://localhost:5173/?flowcanvas=true',
    },
  },
  {
    id: 'login',
    type: 'screenNode',
    position: { x: 550, y: 300 },
    dragHandle: '.drag-handle',
    data: {
      routePath: '/login',
      componentName: 'LoginPage',
      iframeSrc: 'http://localhost:5173/login?flowcanvas=true',
    },
  },
  {
    id: 'dashboard',
    type: 'screenNode',
    position: { x: 1100, y: 300 },
    dragHandle: '.drag-handle',
    data: {
      routePath: '/dashboard',
      componentName: 'DashboardPage',
      iframeSrc: 'http://localhost:5173/dashboard?flowcanvas=true',
    },
  },
  {
    id: 'settings',
    type: 'screenNode',
    position: { x: 1650, y: 100 },
    dragHandle: '.drag-handle',
    data: {
      routePath: '/dashboard/settings',
      componentName: 'SettingsPage',
      iframeSrc: 'http://localhost:5173/dashboard/settings?flowcanvas=true',
    },
  },
  {
    id: 'userDetail',
    type: 'screenNode',
    position: { x: 1650, y: 500 },
    dragHandle: '.drag-handle',
    data: {
      routePath: '/dashboard/users/:id',
      componentName: 'UserDetailPage',
      iframeSrc: 'http://localhost:5173/dashboard/users/1?flowcanvas=true',
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'landing-login',
    source: 'landing',
    target: 'login',
    label: 'Get Started',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'login-dashboard',
    source: 'login',
    target: 'dashboard',
    label: 'Submit Login',
    animated: true,
    style: { strokeDasharray: '5 5' },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'dashboard-settings',
    source: 'dashboard',
    target: 'settings',
    label: 'Settings Link',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'dashboard-userDetail',
    source: 'dashboard',
    target: 'userDetail',
    label: 'View User',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'settings-dashboard',
    source: 'settings',
    target: 'dashboard',
    label: 'Back to Dashboard',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: 'userDetail-dashboard',
    source: 'userDetail',
    target: 'dashboard',
    label: 'Back to Dashboard',
    animated: false,
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];
