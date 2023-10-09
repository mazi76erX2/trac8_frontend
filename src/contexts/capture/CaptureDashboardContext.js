import { createContext, useState } from 'react';
import { convertDateStringsToDayjs } from 'utils/object-util';
import { PropTypes } from 'prop-types';

const CaptureDashboardContext = createContext();

const CaptureDashboardContextProvider = (props) => {
    const [stats, setStats] = useState([]);

    return <CaptureDashboardContext.Provider value={{ stats, setStats }}>{props.children}</CaptureDashboardContext.Provider>;
};

CaptureDashboardContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { CaptureDashboardContextProvider, CaptureDashboardContext };
