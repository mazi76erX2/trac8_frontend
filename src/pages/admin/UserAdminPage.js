import { UserAdminContextProvider } from 'contexts/admin/UserAdminContext';

import UserTable from 'crud/user/UserTable';
import UserEditor from 'crud/user/UserEditor';

// ==============================|| Users ||============================== //

const UserAdminPage = () => {
    return (
        <UserAdminContextProvider>
            <UserTable />
            <UserEditor />
        </UserAdminContextProvider>
    );
};

export default UserAdminPage;
