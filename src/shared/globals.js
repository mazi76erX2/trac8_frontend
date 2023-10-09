/**
 * Variables for DEV
 */
export const API_SERVER_DOMAIN = 'localhost';
export const HTTP_PROTOCOL = 'http';
export const API_SERVER_PORT = '5000';
export const API_BASE_PATH = '/';

/**
 * Variables if you want to run the front-end locally and the back-end remotely
 */
// export const API_SERVER_DOMAIN = 'trac8-dev-api.trac8.com';
// export const HTTP_PROTOCOL = 'https';
// export const API_SERVER_PORT = null;
// export const API_BASE_PATH = '/';

/**
 * Variables for hosted cloud environments
 */
export const SDLC_DOMAIN = 'localhost';
export const PROD_DOMAIN = 'trac8';

/**
 * Determines the backend url dynamically based on the hostname the frontend runs on.
 * @returns configured baseUrl
 */
export const getApiBaseUrl = () => {
    const { hostname } = window.location;
    return `${HTTP_PROTOCOL}://${hostname}` + (API_SERVER_PORT == null ? '' : `:${API_SERVER_PORT}`) + API_BASE_PATH;
};

// Set to undefined if you want to use the browser locale.
// (My Safari and Chrome used en-US to display number, but used en-ZA when typing into input, although system locale was set correctly)
export const LOCALE = 'en-ZA';

export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
export const DEFAULT_TIME_FORMAT = 'HH:mm';

/**
 * File sizes
 */
export const SINGLE_ATTACHMENT_MAX_SIZE = 10;
export const EMAIL_ATTACHMENTS_MAX_SIZE = 20;
export const MAX_NUM_ATTACHMENTS = 10;

export const COMPANY_NAME = 'Trac8';
export const CURRENCY_SYMBOL = 'R';
