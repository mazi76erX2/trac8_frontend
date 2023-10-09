import { LocationContextProvider } from 'contexts/LocationContext';
import { TokenContextProvider } from 'contexts/TokenContext';

import LocationTable from 'crud/location/LocationTable';
import LocationEditor from 'crud/location/LocationEditor';

// ==============================|| Readers ||============================== //

const LocationPage = () => {
    return (
        <TokenContextProvider>
            <LocationContextProvider>
                <LocationTable />
                <LocationEditor />
            </LocationContextProvider>
        </TokenContextProvider>
    );
};

export default LocationPage;
