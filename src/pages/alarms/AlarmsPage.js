import { AlarmContextProvider } from 'contexts/alarm/AlarmContext';
import { AlarmHistoryContextProvider } from 'contexts/alarm/AlarmHistoryContext';
import AlarmTable from 'crud/alarm/AlarmTable';
import AlarmHistoryTable from 'crud/alarm/AlarmHistoryTable';

// ==============================|| Readers ||============================== //

const AlarmsPage = () => {
    return (
        <AlarmContextProvider>
            <AlarmHistoryContextProvider>
                <AlarmTable />
                <AlarmHistoryTable />
            </AlarmHistoryContextProvider>
        </AlarmContextProvider>
    );
};

export default AlarmsPage;
