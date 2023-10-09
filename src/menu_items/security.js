// assets
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import PeopleIcon from '@mui/icons-material/People';
// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
    id: 'security', // this id is used for a role check.
    title: 'Security',
    type: 'group',
    children: [
        {
            id: 'alarms',
            title: 'Alarms',
            type: 'item',
            url: '/alarms',
            icon: NotificationsActiveIcon,
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
            id: 'users',
            title: 'Users',
            type: 'item',
            url: '/users',
            icon: PeopleIcon,
            target: false
        }
    ]
};

export default pages;
