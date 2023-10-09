import PropTypes from 'prop-types';

// material-ui
import { Box } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import { forwardRef, useRef } from 'react';

// ==============================|| MODAL - CARD WRAPPER ||============================== //

const ModalCard = forwardRef(({ children, ...other }) => (
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
        border={false}
        boxShadow={false}
        shadow={(theme) => theme.customShadows.z1}
    >
        <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </MainCard>
));

ModalCard.propTypes = {
    children: PropTypes.node
};

export default ModalCard;
