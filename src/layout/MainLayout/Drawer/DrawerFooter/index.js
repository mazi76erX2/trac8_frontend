import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Stack, Chip } from '@mui/material';

// project import
import DrawerFooterStyled from './DrawerFooterStyled';
import ClientLogo from 'components/ClientLogo';

// ==============================|| DRAWER HEADER ||============================== //

const DrawerFooter = ({ open }) => {
    const theme = useTheme();

    return (
        // only available in paid version
        <DrawerFooterStyled theme={theme} open={open}>
            <Stack direction="row" spacing={1} alignItems="center">
                <ClientLogo />
            </Stack>
        </DrawerFooterStyled>
    );
};

DrawerFooter.propTypes = {
    open: PropTypes.bool
};

export default DrawerFooter;
