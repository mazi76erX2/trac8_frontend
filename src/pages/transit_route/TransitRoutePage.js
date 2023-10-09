import { TransitRouteContextProvider } from 'contexts/TransitRouteContext';
import { LocationContextProvider } from 'contexts/LocationContext';
import { WaypointContextProvider } from 'contexts/WaypointContext';

import TransitRouteTable from 'crud/transit_route/TransitRouteTable';
import TransitRouteEditor from 'crud/transit_route/TransitRouteEditor';

// ==============================|| Readers ||============================== //

const TransitRoutePage = () => {
    return (
        <TransitRouteContextProvider>
            <LocationContextProvider>
                <WaypointContextProvider>
                    <TransitRouteTable />
                    <TransitRouteEditor />
                </WaypointContextProvider>
            </LocationContextProvider>
        </TransitRouteContextProvider>
    );
};

export default TransitRoutePage;
