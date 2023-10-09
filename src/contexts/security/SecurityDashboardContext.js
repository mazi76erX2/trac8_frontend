import { createContext, useState } from 'react';
import { convertDateStringsToDayjs } from 'utils/object-util';
import { PropTypes } from 'prop-types';

const SecurityDashboardContext = createContext();

const SecurityDashboardContextProvider = (props) => {
    const [stats, setStats] = useState([]);

    return <SecurityDashboardContext.Provider value={{ stats, setStats }}>{props.children}</SecurityDashboardContext.Provider>;
};

SecurityDashboardContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { SecurityDashboardContextProvider, SecurityDashboardContext };
