import { MenuItem } from '@mui/material';

const createMenuItemsFromEnum = (e) => {
    return Object.entries(e.dictionary).map(([key, value]) => (
        <MenuItem key={key} value={key}>
            {value}
        </MenuItem>
    ));
};

export { createMenuItemsFromEnum };
