import React, { createContext, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';

const SnackbarContext = createContext();

const SnackbarContextProvider = (props) => {
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const autoHideDuration = 3000;

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    return (
        <SnackbarContext.Provider value={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }}>
            {props.children}
        </SnackbarContext.Provider>
    );
};

SnackbarContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { SnackbarContextProvider, SnackbarContext };
