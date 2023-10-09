import { useContext } from 'react';
// material-ui

import { Box, Typography } from '@mui/material';

// project import
import NavGroup from './NavGroup';
import menuItem from 'menu_items';
import { AuthContext } from 'hooks/auth-context';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
    const { authData } = useContext(AuthContext);

    const navGroups = menuItem().items.map((item) => {
        switch (item.type) {
            case 'group':
                return authData.roles.indexOf(item.id) > -1 ? <NavGroup key={item.id} item={item} /> : '';
            default:
                return (
                    <Typography key={item.id} variant="h6" color="error" align="center">
                        Fix - Navigation Group
                    </Typography>
                );
        }
    });

    return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
};

export default Navigation;
