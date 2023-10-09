import { ReaderStatusContextProvider } from 'contexts/reader/ReaderStatusContext';

import ReaderStatusTable from 'crud/reader/reader-status/ReaderStatusTable';

// ==============================|| Readers ||============================== //

const ReaderStatusPage = () => {
    return (
        <ReaderStatusContextProvider>
            <ReaderStatusTable />
        </ReaderStatusContextProvider>
    );
};

export default ReaderStatusPage;
