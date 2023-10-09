// assets
import PeopleIcon from '@mui/icons-material/People';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PermDataSettingIcon from '@mui/icons-material/PermDataSetting';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const generalGroup = {
    id: 'generalGroup',
    title: 'General',
    type: 'group',
    children: [
        {
            id: 'location',
            title: 'Locations',
            type: 'item',
            url: '/location',
            icon: LocationOnIcon,
            target: false
        },
        {
            id: 'transit-routes',
            title: 'Transit Routes',
            type: 'item',
            url: '/transit-routes',
            icon: RouteIcon,
            target: false
        }
    ]
};

const stockGroup = {
    id: 'stockGroup',
    title: 'Stock',
    type: 'group',
    children: [
        {
            id: 'items',
            title: 'Items',
            type: 'item',
            url: '/items',
            icon: LocalOfferIcon,
            target: false
        },
        {
            id: 'tags-category',
            title: 'Item Category',
            type: 'item',
            url: '/tags/category',
            icon: CategoryIcon,
            target: false
        },
        {
            id: 'tags-type',
            title: 'Item Type',
            type: 'item',
            url: '/tags/type',
            icon: StyleIcon,
            target: false
        },
        {
            id: 'stock-take',
            title: 'Stock Take',
            type: 'item',
            url: '/stock-take',
            icon: InventoryIcon,
            target: false
        }
    ]
};

const pages = {
    id: 'admin', // this id is used for a role check.
    title: 'Administrator Settings',
    type: 'group',
    children: [
        generalGroup,
        stockGroup,
        {
            id: 'alarms',
            title: 'Alarms',
            type: 'item',
            url: '/alarms',
            icon: NotificationsActiveIcon,
            target: false
        },
        {
            id: 'email-notifications',
            title: 'Email Notifications',
            type: 'item',
            url: '/email-notifications',
            icon: ForwardToInboxIcon,
            target: false
        },
        {
            id: 'users',
            title: 'Users',
            type: 'item',
            url: '/users',
            icon: PeopleIcon,
            target: false
        },
        {
            id: 'readers',
            title: 'Reader Settings',
            type: 'item',
            url: '/admin/readers',
            icon: PermDataSettingIcon,
            target: false
        },
        {
            id: 'reader-status',
            title: 'Reader Status',
            type: 'item',
            url: '/reader/status',
            icon: SettingsInputAntennaIcon,
            target: false
        },
        {
            id: 'system-config',
            title: 'System Configuration',
            type: 'item',
            url: '/system-config',
            icon: SettingsIcon,
            target: false
        }
    ]
};

export default pages;
