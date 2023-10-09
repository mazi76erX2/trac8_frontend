import { ReaderAdminContextProvider } from 'contexts/admin/ReaderAdminContext';

import ReaderTable from 'crud/reader/ReaderTable';
import ReaderEditor from 'crud/reader/ReaderEditor';

// ==============================|| Readers ||============================== //

const ReaderAdminPage = () => {
    return (
        <ReaderAdminContextProvider>
            <ReaderTable />
            <ReaderEditor />
        </ReaderAdminContextProvider>
    );
};

export default ReaderAdminPage;
