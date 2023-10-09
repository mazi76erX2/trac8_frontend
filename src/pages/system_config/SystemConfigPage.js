import { SystemConfigContextProvider } from 'contexts/SystemConfigContext';

import SystemConfigTable from 'crud/system_config/SystemConfigTable';

// ==============================|| Readers ||============================== //

const SystemConfigPage = () => {
    return (
        <SystemConfigContextProvider>
            <SystemConfigTable />
        </SystemConfigContextProvider>
    );
};

export default SystemConfigPage;
