import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project import
import Loadable from 'components/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/Register')));
const ForgotPassword = Loadable(lazy(() => import('pages/authentication/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('pages/authentication/ResetPassword')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: 'auth',
            element: <AuthLogin />
        },
        {
            path: 'register',
            element: <AuthRegister />
        },
        {
            path: 'forgot-password',
            element: <ForgotPassword />
        },
        {
            path: 'reset-password/*',
            element: <ResetPassword />
        },
        {
            path: '',
            element: <AuthLogin />
        }
    ]
};

export default LoginRoutes;
