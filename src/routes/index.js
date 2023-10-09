import { useContext, useState, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';

// project import
import LoginRoutes from './LoginRoutes';
import { getMainRoutes } from './MainRoutes';
import { AuthContext } from 'hooks/auth-context';
import { UserContext } from 'hooks/user-context';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    const authContext = useContext(AuthContext);
    const userContext = useContext(UserContext);

    /**
     *  If a user refreshes the page, it takes an additional render to load the context.
     *  So isAuth is false and then the token is loaded and set true. So this flag will
     *  not render the content until the context is verified.
     **/
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        setAuthChecked(true);
    }, []);

    const content = [];
    if (authContext && userContext && authContext.authData && authContext.authData.isAuth) {
        content.push(getMainRoutes(authContext.authData));
    } else {
        content.push(LoginRoutes);
    }
    return useRoutes(content);
}
