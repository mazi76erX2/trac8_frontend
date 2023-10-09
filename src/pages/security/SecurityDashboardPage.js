import { SecurityDashboardContext, SecurityDashboardContextProvider } from 'contexts/security/SecurityDashboardContext';
import SecurityDashboard from 'dashboards/SecurityDashboard';

const SecurityDashboardPage = () => {
    return (
        <SecurityDashboardContextProvider>
            <SecurityDashboard />
        </SecurityDashboardContextProvider>
    );
};

export default SecurityDashboardPage;
