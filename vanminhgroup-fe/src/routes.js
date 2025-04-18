import { Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import UserList from './pages/User/UserList';
import RoleList from './pages/Role/RoleList';
import PermissionList from './pages/Permission/PermissionList';
import UnitList from './pages/Unit/UnitList';

const routes = [
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { path: '/', element: <Navigate to="/users" /> },
            { path: 'users', element: <UserList /> },
            { path: 'roles', element: <RoleList /> },
            { path: 'permissions', element: <PermissionList /> },
            { path: 'units', element: <UnitList /> },
        ]
    }
];

export default routes;