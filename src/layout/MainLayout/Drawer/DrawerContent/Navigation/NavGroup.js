import PropTypes from 'prop-types';
import { useState } from 'react';
import { Collapse, ListItemButton, ListItemText, List } from '@mui/material';
import { useSelector } from 'react-redux';

// project import
import NavItem from './NavItem';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

const NavGroup = ({ item, level = 0 }) => {
    const menu = useSelector((state) => state.menu);
    const { drawerOpen } = menu;
    const [open, setOpen] = useState(true); // New state variable to toggle the collapse

    const handleClick = () => {
        setOpen(!open); // Toggle the state when clicked
    };

    const navCollapse = item.children?.map((menuItem) => {
        switch (menuItem.type) {
            case 'group':
                return <NavGroup key={menuItem.id} item={menuItem} level={level + 1} />;
            case 'item':
                return <NavItem key={menuItem.id} item={menuItem} level={level + 1} />;
            default:
                return (
                    <Typography key={menuItem.id} variant="h6" color="error" align="center">
                        Fix - Group Collapse or Items
                    </Typography>
                );
        }
    });

    return (
        <>
            <ListItemButton onClick={handleClick} style={{ paddingLeft: `${(level + 1) * 16}px` }}>
                <ListItemText primary={item.title} />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {navCollapse}
                </List>
            </Collapse>
        </>
    );
};

NavGroup.propTypes = {
    item: PropTypes.object,
    level: PropTypes.number
};

export default NavGroup;
