import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { Snackbar, Alert } from '@mui/material';

// ==============================|| MINIMAL LAYOUT ||============================== //

const MinimalLayout = () => {
    const { setErrorMessage, setSuccessMessage, errorMessage, successMessage } = useContext(SnackbarContext);

    return (
        <div style={{ background: 'rgb(5, 98, 148)' }}>
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
            <Outlet />
        </div>
    );
};

export default MinimalLayout;
