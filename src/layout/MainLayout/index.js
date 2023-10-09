import { useEffect, useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Box, Toolbar, useMediaQuery } from '@mui/material';

// project import
import Drawer from './Drawer';
import Header from './Header';
import navigation from 'menu_items';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

// types
import { openDrawer } from 'store/reducers/menu';

import { SnackbarContext } from '../../contexts/SnackbarContext';
import { UserAdminContextProvider } from 'contexts/admin/UserAdminContext';
import { PasswordContextProvider } from 'contexts/user/PasswordContext';
import UserEditor from 'crud/user/UserEditor';
import PasswordEditor from 'crud/user/PasswordEditor';
import { AuthContext } from 'hooks/auth-context';
import LoginMonitor from 'components/LoginMonitor';

// ==============================|| MAIN LAYOUT ||============================== //

const MainLayout = () => {
    const theme = useTheme();
    const matchDownLG = useMediaQuery(theme.breakpoints.down('xl'));
    const dispatch = useDispatch();

    const { setErrorMessage, setSuccessMessage, errorMessage, successMessage } = useContext(SnackbarContext);
    const authContext = useContext(AuthContext);

    const { drawerOpen } = useSelector((state) => state.menu);

    // drawer toggler
    const [open, setOpen] = useState(drawerOpen);
    const handleDrawerToggle = () => {
        setOpen(!open);
        dispatch(openDrawer({ drawerOpen: !open }));
    };

    // set media wise responsive drawer
    useEffect(() => {
        setOpen(!matchDownLG);
        dispatch(openDrawer({ drawerOpen: !matchDownLG }));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchDownLG]);

    useEffect(() => {
        if (open !== drawerOpen) setOpen(drawerOpen);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawerOpen]);

    return (
        <UserAdminContextProvider>
            <PasswordContextProvider>
                {authContext.authData.isAuth && <LoginMonitor />}
                <UserEditor />
                <PasswordEditor />
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Snackbar
                        open={successMessage && successMessage.length > 0}
                        autoHideDuration={6000}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
                            {successMessage}
                        </Alert>
                    </Snackbar>
                    <Snackbar
                        open={errorMessage && errorMessage.length > 0}
                        autoHideDuration={6000}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
                            {errorMessage}
                        </Alert>
                    </Snackbar>
                    <Header open={open} handleDrawerToggle={handleDrawerToggle} />
                    <Drawer open={open} handleDrawerToggle={handleDrawerToggle} />
                    <Box component="main" sx={{ width: '100%', flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                        <Toolbar />
                        <Breadcrumbs navigation={navigation} title card={'false'} divider={false} />
                        <Outlet />
                    </Box>
                </Box>
            </PasswordContextProvider>
        </UserAdminContextProvider>
    );
};

export default MainLayout;
