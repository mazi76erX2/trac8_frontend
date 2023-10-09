import { createContext, useState } from 'react';
import { PropTypes } from 'prop-types';
import { convertDateStringsToDayjs } from 'utils/object-util';

const TransitRouteContext = createContext();
const TransitRouteContextProvider = (props) => {
    const [records, setRecords] = useState([]);
    const [selectedRecordIds, setSelectedRecordIds] = useState([]);
    const [record, setRecord] = useState(null);
    const [count, setCount] = useState(0);
    // addRecord function - adds a new record to the state variable

    const addRecord = (record) => {
        // find index of existing record
        const indexOfExistingRecord = records.findIndex((a) => a.id === record.id);
        // convert date strings in the record object to dayjs object
        record = convertDateStringsToDayjs(record);
        // if existing record found, replace with new record; else, add new record
        if (indexOfExistingRecord > -1) {
            setRecords([...records.slice(0, indexOfExistingRecord), record, ...records.slice(indexOfExistingRecord + 1)]);
        } else {
            setRecords([...records, record]);
        }
    };

    // removeRecord function - removes a record from the state variable
    const removeRecord = (record) => {
        // find index of existing record
        const indexOfExistingRecord = records.findIndex((a) => a.id === record.id);
        // if existing record found, remove it
        if (indexOfExistingRecord > -1) {
            setRecords([...records.splice(indexOfExistingRecord, 1)]);
        }
    };

    return (
        <TransitRouteContext.Provider
            value={{
                setRecords,
                setSelectedRecordIds,
                setRecord,
                setCount,
                setRecord,
                addRecord,
                removeRecord,
                records,
                count,
                record,
                selectedRecordIds
            }}
        >
            {props.children}
        </TransitRouteContext.Provider>
    );
};

TransitRouteContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { TransitRouteContextProvider, TransitRouteContext };
