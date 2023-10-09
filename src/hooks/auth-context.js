import React, { useEffect, useState, useMemo, useContext } from 'react';
import { updateObject, decodeToken } from '../shared/utility';
import axios from '../axios-base';

export const AuthContext = React.createContext();

const useContextFactory = (name, context) => {
    return () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const ctx = useContext(context);
        if (ctx === undefined) {
            throw new Error(`use${name} must be used within a ${name}Provider.`);
        }
        return ctx;
    };
};

export const useAuthContext = () => useContextFactory('AuthContext', AuthContext);

/**
 * The context that controls authentication with JWT tokens
 * @param {*} props
 * @returns
 */
const AuthContextProvider = (props) => {
    /**
     * Set all the vairables to null, so that the useEffect method can load and respond correctly to what has been saved.
     * Previous it was: { userName: localStorage.getItem('userName') } but this caused the varibales to be loaded
     * without any validaion on them.
     */
    const [authState, setAuthState] = useState({
        isAuth: false,
        userName: null,
        userId: null,
        token: null,
        expirationDate: null,
        roles: null
    });

    /**
     * When the component is created check if any authentication details are still stored and if they are valid.
     * This is helpful for when a user refreshes the page, so then it reloads the context without having to
     * log in again.
     */
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (!savedToken) {
            logoutHandler();
        } else {
            const savedExpirationDate = new Date(localStorage.getItem('expirationDate'));
            const savedUserName = localStorage.getItem('userName');
            const savedUserId = localStorage.getItem('userId');
            const savedRoles = JSON.parse(localStorage.getItem('roles'));

            if (savedExpirationDate < new Date()) {
                logoutHandler();
            } else {
                setAuthState(
                    updateObject(authState, {
                        isAuth: true,
                        userName: savedUserName,
                        userId: savedUserId,
                        token: savedToken,
                        roles: savedRoles,
                        expirationDate: savedExpirationDate
                    })
                );
                axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            }
        }
    }, []);

    const loginHandler = (_token) => {
        const tokenObj = decodeToken(_token);

        const _expirationDate = new Date(tokenObj.exp * 1000);
        const _userName = tokenObj.userName;
        const _userId = tokenObj.user_id;
        const _firstname = tokenObj.firstname;
        const _surname = tokenObj.surname;
        const _roles = tokenObj.roles;

        axios.defaults.headers.common['Authorization'] = `Bearer ${_token}`;

        setAuthState(
            updateObject(authState, {
                isAuth: true,
                userName: _userName,
                userId: _userId,
                firstname: _firstname,
                surname: _surname,
                token: _token,
                expirationDate: _expirationDate,
                roles: _roles
            })
        );
        localStorage.setItem('userName', _userName);
        localStorage.setItem('userId', _userId);
        localStorage.setItem('token', _token);
        localStorage.setItem('expirationDate', _expirationDate);
        localStorage.setItem('roles', JSON.stringify(_roles));
    };

    const logoutHandler = () => {
        setAuthState(
            updateObject(authState, { isAuth: false, userName: null, userId: null, token: null, expirationDate: null, roles: null })
        );
        localStorage.removeItem('userName');
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        localStorage.removeItem('expirationDate');
        localStorage.removeItem('roles');
        axios.defaults.headers.common['Authorization'] = null;
    };

    const refreshTokenHandler = () => {
        if (authState && !(authState.expirationDate == null)) {
            const expiresIn = authState.expirationDate.getTime() - new Date().getTime();

            // If the token has already expired, then logoutHandler
            if (expiresIn <= 0) {
                logoutHandler();
            } else {
                //The token has not expired yet, so try and refresh the token
                axios
                    .get('authenticate/refresh')
                    .then((res) => {
                        //Got the new token set the auth context
                        loginHandler(res.data);
                    })
                    .catch((err) => {
                        //Error occurred, so logoutHandler for safety
                        logoutHandler();
                    });
            }
        }
    };

    const memoValue = useMemo(
        () => ({
            authData: authState,
            login: loginHandler,
            logout: logoutHandler,
            refreshToken: refreshTokenHandler
        }),
        [authState]
    );

    return <AuthContext.Provider value={memoValue}>{props.children}</AuthContext.Provider>;
};

export default AuthContextProvider;
