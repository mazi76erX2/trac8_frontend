import PropTypes from 'prop-types';

// material-ui
import { Box, Grid } from '@mui/material';

// project import
import AuthCard from './AuthCard';
import logo from 'assets/images/logo.png';
import apollo from 'assets/images/apollo.png';

// assets
import AuthBackground from 'assets/images/auth/AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

const AuthWrapper = ({ children }) => (
    <Box sx={{ minHeight: '100vh' }}>
        <AuthBackground />
        <Grid
            container
            direction="column"
            justifyContent="center"
            sx={{
                minHeight: '100vh'
            }}
        >
            <Grid item xs={12}>
                <Grid
                    item
                    xs={12}
                    container
                    justifyContent="center"
                    alignItems="center"
                    sx={{ minHeight: { xs: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
                >
                    <Grid item sx={{ maxWidth: { xs: 400, lg: 475 } }}>
                        <div style={{ margin: '36px auto', display: 'flex' }}>
                            <img src={logo} alt="Trac8" style={{ width: '100%', margin: 'auto' }} />
                        </div>
                        <AuthCard style={{ margin: 'auto' }}>{children}</AuthCard>
                        <div style={{ margin: '36px auto', display: 'flex' }}>
                            <img src={apollo} alt="Trac8" style={{ width: '100%', margin: 'auto' }} />
                        </div>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    </Box>
);

AuthWrapper.propTypes = {
    children: PropTypes.node
};

export default AuthWrapper;
