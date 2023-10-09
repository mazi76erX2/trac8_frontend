import PropTypes from 'prop-types';
import { useState, useContext } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { UserAdminContext } from 'contexts/admin/UserAdminContext';
import { AuthContext } from 'hooks/auth-context';
import { PasswordContext } from 'contexts/user/PasswordContext';
import PasswordIcon from '@mui/icons-material/Password';

// assets
import { EditOutlined, ProfileOutlined, LogoutOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import UserProfileApi from 'api/UserProfileApi';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
    const { setRecord, setOwnProfile } = useContext(UserAdminContext);
    const passwordContext = useContext(PasswordContext);
    const { authData } = useContext(AuthContext);
    const theme = useTheme();
    const userProfileApi = new UserProfileApi();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
    };

    return (
        <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32, color: theme.palette.grey[500] } }}>
            <ListItemButton
                selected={selectedIndex === 0}
                onClick={async (event) => {
                    let currentUserProfile = await userProfileApi.getOwn();
                    handleListItemClick(event, 0);
                    passwordContext.setRecord(currentUserProfile?.data);
                }}
            >
                <ListItemIcon>
                    <PasswordIcon />
                </ListItemIcon>
                <ListItemText primary="Change Password" />
            </ListItemButton>
            <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutOutlined />
                </ListItemIcon>
                <ListItemText primary="Logout" />
            </ListItemButton>
        </List>
    );
};

ProfileTab.propTypes = {
    handleLogout: PropTypes.func
};

export default ProfileTab;
