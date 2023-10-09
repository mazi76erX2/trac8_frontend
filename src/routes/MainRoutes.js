import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra_pages/SamplePage')));

// render - utilities
const Typography = Loadable(lazy(() => import('pages/components-overview/Typography')));
const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

const UserAdminPage = Loadable(lazy(() => import('pages/admin/UserAdminPage')));
const ReaderAdminPage = Loadable(lazy(() => import('pages/admin/ReaderAdminPage')));
const AlarmsPage = Loadable(lazy(() => import('pages/alarms/AlarmsPage')));
const TagsCategoryPage = Loadable(lazy(() => import('pages/item_category/ItemCategoryPage')));
const TagsTypePage = Loadable(lazy(() => import('pages/item_type/ItemTypePage')));
const StockTakePage = Loadable(lazy(() => import('pages/stock_take/StockTakePage')));
const ReaderStatusPage = Loadable(lazy(() => import('pages/reader/ReaderStatusPage')));
const SystemConfigPage = Loadable(lazy(() => import('pages/system_config/SystemConfigPage')));
const EmailNotificationPage = Loadable(lazy(() => import('pages/email_notification/EmailNotificationPage')));
const LocationPage = Loadable(lazy(() => import('pages/location/LocationPage')));
const TransitRoutePage = Loadable(lazy(() => import('pages/transit_route/TransitRoutePage')));
const ItemPage = Loadable(lazy(() => import('pages/items/ItemsPage')));

// ==============================|| MAIN ROUTING ||============================== //

export const getMainRoutes = (authData) => {
    let isAdmin = authData.roles.indexOf('admin') > -1;
    let isSecurity = authData.roles.indexOf('security') > -1;
    let isCapture = authData.roles.indexOf('capture') > -1;

    let children = [];
    if (isAdmin) {
        children.push({
            path: '/',
            element: <ReaderStatusPage />
        });
        children.push({
            path: '/users',
            element: <UserAdminPage />
        });
        children.push({
            path: '/admin/readers',
            element: <ReaderAdminPage />
        });
        children.push({
            path: '/alarms',
            element: <AlarmsPage />
        });
        children.push({
            path: '/items',
            element: <ItemPage />
        });
        children.push({
            path: '/tags/category',
            element: <TagsCategoryPage />
        });
        children.push({
            path: '/tags/type',
            element: <TagsTypePage />
        });
        children.push({
            path: '/stock-take',
            element: <StockTakePage />
        });
        children.push({
            path: '/email-notifications',
            element: <EmailNotificationPage />
        });
        children.push({
            path: '/location',
            element: <LocationPage />
        });
        children.push({
            path: '/transit-routes',
            element: <TransitRoutePage />
        });
        children.push({
            path: '/system-config',
            element: <SystemConfigPage />
        });
        children.push({
            path: '/reader/status',
            element: <ReaderStatusPage />
        });
    }
    if (isSecurity) {
        children.push({
            path: '/',
            element: <AlarmsPage />
        });
        children.push({
            path: '/alarms',
            element: <AlarmsPage />
        });
        children.push({
            path: '/reader/status',
            element: <ReaderStatusPage />
        });
        children.push({
            path: '/users',
            element: <UserAdminPage />
        });
    }
    if (isCapture) {
        children.push({
            path: '/',
            element: <ItemPage />
        });
        children.push({
            path: '/tags/category',
            element: <TagsCategoryPage />
        });
        children.push({
            path: '/tags/type',
            element: <TagsTypePage />
        });
        children.push({
            path: '/stock-take',
            element: <StockTakePage />
        });
        children.push({
            path: '/reader/status',
            element: <ReaderStatusPage />
        });
        children.push({
            path: '/users',
            element: <UserAdminPage />
        });
    }

    children = [
        ...children,
        ...[
            {
                path: 'color',
                element: <Color />
            },
            {
                path: 'sample-page',
                element: <SamplePage />
            },
            {
                path: 'shadow',
                element: <Shadow />
            },
            {
                path: 'typography',
                element: <Typography />
            },
            {
                path: 'icons/ant',
                element: <AntIcons />
            }
        ]
    ];
    const MainRoutes = {
        path: '/',
        element: <MainLayout />,
        children
    };
    return MainRoutes;
};

// export default MainRoutes;
