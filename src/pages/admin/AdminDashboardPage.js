import { AdminDashboardContext, AdminDashboardContextProvider } from 'contexts/admin/AdminDashboardContext';
import AdminDashboard from 'dashboards/AdminDashboard';

const AdminDashboardPage = () => {
    return (
        <AdminDashboardContextProvider>
            <AdminDashboard />
        </AdminDashboardContextProvider>
    );
};

export default AdminDashboardPage;
