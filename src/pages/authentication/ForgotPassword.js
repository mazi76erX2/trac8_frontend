import { Link } from 'react-router-dom';

// material-ui
import { Grid, Stack, Typography } from '@mui/material';
import AuthWrapper from './AuthWrapper';
import AuthForgotPassword from './auth-forms/AuthForgotPassword';

// ================================|| REGISTER ||================================ //

const ForgotPassword = () => (
    <AuthWrapper>
        <Grid style={{ background: 'rgb(5, 98, 148)' }} container spacing={5}>
            <Grid item>
                <AuthForgotPassword />
            </Grid>
        </Grid>
    </AuthWrapper>
);

export default ForgotPassword;
