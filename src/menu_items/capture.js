// assets
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsInputAntennaIcon from '@mui/icons-material/SettingsInputAntenna';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';
// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
    id: 'capture', // this id is used for a role check.
    title: 'Capture',
    type: 'group',
    children: [
        {
            id: 'tags-category',
            title: 'Tags Category',
            type: 'item',
            url: '/tags/category',
            icon: CategoryIcon,
            target: false
        },
        {
            id: 'tags-type',
            title: 'Tags Type',
            type: 'item',
            url: '/tags/type',
            icon: StyleIcon,
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
