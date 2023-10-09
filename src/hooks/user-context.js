import React, { useEffect, useState, useMemo, useContext } from 'react';
import { AuthContext } from './auth-context';
import axios from '../axios-base';
import { updateObject } from '../shared/utility';

//Create the context to keep the data
export const UserContext = React.createContext();

//Create a hook for ease of use
export const useUserContext = () => React.useContext(UserContext);

/**
 * The context to control authorization of the user.
 * The menu is built from the authorized pages received from the backend.
 * @param {*} props
 * @returns
 */
const UserContextProvider = (props) => {
    const authContext = useContext(AuthContext);

    //The user data in state
    const [userState, setUserState] = useState({
        access: [],
        menuConfig: [
            {
                id: 'Admin',
                name: 'Admin',
                show: false,
                children: [{ id: 'user', code: 'user', name: 'User', show: false, userRole: 'ADMIN', children: [] }]
            },
            {
                id: 'Capture',
                name: 'Capture',
                show: false,
                children: []
            },
            {
                id: 'Security',
                name: 'Security',
                show: false,
                children: []
            }
        ]
    });

    useEffect(() => {
        //Load user data and preferences
        if (authContext.authData.isAuth) {
            // axios.get("SystemUserRoleAccess/findForUser")
            // 	.then(res => {
            // 		setUserState((userState) => updateObject(userState, { access: [...res.data] }));
            // 	})
            // 	.catch(err => {
            // 		console.log(err);
            // 	});
        } else {
            //Clear the state
            // setUserState(updateObject(userState, { access: [], menuConfig: [] }));
        }
    }, [authContext.authData.isAuth]);

    const menuHandler = (menuId, showMenu) => {
        const index = userState.menuConfig.findIndex((m) => m && m.id && m.id === menuId);
        if (index >= 0) {
            const menu = [...userState.menuConfig];
            menu[index].show = showMenu;
            setUserState(updateObject(userState, { menuConfig: menu }));
        } else {
            // console.log("Menu item not found");
        }
    };

    const isAuthorized = (moduleCode, action = 'VIEW') => {
        let allowAction = 'allowView';
        if (action) {
            switch (action) {
                case 'VIEW':
                    allowAction = 'allowView';
                    break;
                case 'CREATE':
                    allowAction = 'allowCreate';
                    break;
                case 'READ':
                    allowAction = 'allowRead';
                    break;
                case 'WRITE':
                    allowAction = 'allowWrite';
                    break;
                case 'DELETE':
                    allowAction = 'allowDelete';
                    break;
                default:
                    break;
            }
        }

        //If the systemModule's code is present in the state then the user is authorized to view
        //TODO: (JHough 2023-02-01) The system module and access to components have not been defined.
        /*
		if (userState.access && userState.access.length > 0) {
			return userState.access.some(m => m && m.systemModule.code === moduleCode && m[allowAction]);
		}
		return false;
		*/

        //Allowing at the moment until more complex authorization is created.
        return true;
    };

    const getToolbarMenuItems = () => {
        if (userState.menuConfig) {
            const index = userState.menuConfig.findIndex((m) => m && m.code && m.code === 'TOOLBAR');
            if (index >= 0) {
                return userState.menuConfig[index].children;
            }
        }
        return null;
    };

    const memoValue = useMemo(
        () => ({
            userData: userState,
            menuHandler: menuHandler,
            isAuthorized: isAuthorized,
            getToolbarMenuItems: getToolbarMenuItems
        }),
        [userState]
    );

    return <UserContext.Provider value={memoValue}>{props.children}</UserContext.Provider>;
};

export default UserContextProvider;
