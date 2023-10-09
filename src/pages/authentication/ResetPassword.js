import { Link } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthResetPassword from './auth-forms/AuthResetPassword';

// ================================|| REGISTER ||================================ //

const ResetPassword = () => (
    <AuthWrapper>
        <Grid style={{ background: 'rgb(5, 98, 148)' }} container>
            <Grid item>
                <AuthResetPassword />
            </Grid>
        </Grid>
    </AuthWrapper>
);

export default ResetPassword;
