import { CaptureDashboardContext, CaptureDashboardContextProvider } from 'contexts/capture/CaptureDashboardContext';
import CaptureDashboard from 'dashboards/CaptureDashboard';

const CaptureDashboardPage = () => {
    return (
        <CaptureDashboardContextProvider>
            <CaptureDashboard />
        </CaptureDashboardContextProvider>
    );
};

export default CaptureDashboardPage;
