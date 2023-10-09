// project import
import admin from './admin';
import capture from './capture';
import security from './security';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
    items: [admin, capture, security]
};

export default () => menuItems;
