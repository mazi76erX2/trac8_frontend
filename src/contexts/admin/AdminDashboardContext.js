import { createContext, useState } from 'react';
import { convertDateStringsToDayjs } from 'utils/object-util';
import { PropTypes } from 'prop-types';

const AdminDashboardContext = createContext();

const AdminDashboardContextProvider = (props) => {
    const [stats, setStats] = useState([]);

    return <AdminDashboardContext.Provider value={{ stats, setStats }}>{props.children}</AdminDashboardContext.Provider>;
};

AdminDashboardContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { AdminDashboardContextProvider, AdminDashboardContext };
