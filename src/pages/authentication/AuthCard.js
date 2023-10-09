import PropTypes from 'prop-types';

// material-ui
import { Box } from '@mui/material';
import Logo from 'components/Logo';

// project import
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

const AuthCard = ({ children, ...other }) => (
    <MainCard
        sx={{
            maxWidth: { xs: 400, lg: 475 },
            margin: { xs: 2.5, md: 3 },
            '& > *': {
                flexGrow: 1,
                flexBasis: '50%'
            },
            backgroundColor: 'transparent'
        }}
        content={false}
        {...other}
        // border={false}
        // boxShadow={false}
    >
        <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>
            <div style={{ display: 'flex' }}>
                <div style={{ margin: 'auto' }}>{children}</div>
            </div>
        </Box>
    </MainCard>
);

AuthCard.propTypes = {
    children: PropTypes.node
};

export default AuthCard;
