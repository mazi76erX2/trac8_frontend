import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../hooks/auth-context';
import { useInterval } from './useInterval';
import { useNavigate } from 'react-router-dom';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const LoginMonitor = () => {
    //In milliseconds
    const TIME_TO_RESPOND = 60000;
    const IDLE_TIME = 15 * 60000;

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TIME_TO_RESPOND);

    useEffect(() => {
        // console.log("useEffect: LoginMonitor authData changed");
        let warnTimer;
        let refreshTimer;
        let lastActivity;

        const expiresIn = authContext.authData.expirationDate.getTime() - new Date().getTime();
        // console.log("Expiring in " + expiresIn + " ms");

        let shouldRefresh = () => {
            // console.log("Should refresh?" + (lastActivity > new Date().getTime() - IDLE_TIME));
            // If there has been any activity since IDLE_TIME ago, then refresh
            if (lastActivity > new Date().getTime() - IDLE_TIME) {
                authContext.refreshToken();
            }
        };

        const setTimers = () => {
            warnTimer = setTimeout(() => setShowConfirmDialog(true), expiresIn - TIME_TO_RESPOND);
            refreshTimer = setInterval(shouldRefresh, expiresIn / 4);
        };

        const clearTimers = () => {
            if (warnTimer) clearTimeout(warnTimer);
            if (refreshTimer) clearInterval(refreshTimer);
        };

        let logTime = () => {
            //Using a faster method than new Date().getTime();, I don't want to create a new object everytime, just need the milliseconds numer literal.
            lastActivity = Date.now();
        };

        const events = [
            'load',
            // 'mousemove', //Just too much resetting
            'mousedown',
            'click',
            'scroll',
            'keypress'
        ];

        setTimers();

        for (let i in events) {
            window.addEventListener(events[i], logTime);
        }

        return () => {
            for (let i in events) {
                window.removeEventListener(events[i], logTime);
            }
            clearTimers();
        };
    }, [authContext.authData]);

    /**
     * Start the countdown timer
     */
    useInterval(
        () => {
            setTimeLeft(timeLeft - 1000);
            if (timeLeft <= 0) {
                confirmHandler(true);
            }
        },
        showConfirmDialog ? 1000 : null
    );

    const confirmHandler = (doLogout) => {
        setShowConfirmDialog(false);
        setTimeLeft(TIME_TO_RESPOND);
        if (doLogout) {
            // console.log("Chose to logoff");
            authContext.logout();
            navigate('/');
        } else {
            // console.log("Chose to refresh token");
            authContext.refreshToken();
        }
    };

    return (
        <Dialog open={showConfirmDialog} onClose={() => confirmHandler(false)}>
            <DialogTitle>
                Logout?
                <IconButton edge="end" color="inherit" onClick={() => confirmHandler(false)} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText> You will be logged out in {timeLeft / 1000} seconds. Do you want to logout? </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => confirmHandler(true)} color="primary">
                    Logout
                </Button>
                <Button onClick={() => confirmHandler(false)} color="primary">
                    Stay
                </Button>
            </DialogActions>
        </Dialog>
    );
};
export default LoginMonitor;
