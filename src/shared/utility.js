import { LOCALE } from './globals';
import defaultLogo from '../assets/images/logos/default.png';

export const updateObject = (oldObject, updatedProperties) => {
    return {
        ...oldObject,
        ...updatedProperties
    };
};

/**
 * Checks if a value exists for the given path in the object.
 * Convenience method so that you don't have to check for nulls in the whole path.
 * @param {*} path
 * @returns
 */
export const exists = (obj, key) => {
    return key.split('.').every((x) => {
        if (typeof obj != 'object' || obj === null || !x in obj) return false;
        obj = obj[x];
        return true;
    });
};

export const isEqual = (a, b) => {
    if (a === b) {
        return true;
    } else if (a == null && !(b == null)) {
        return false;
    } else if (b == null && !(a == null)) {
        return false;
    } else {
        let equal = true;
        let complexObj = false;
        for (let key in a) {
            complexObj = true;
            equal = equal && isEqual(a[key], b[key]);
        }

        if (!complexObj) {
            return a === b;
        }
        return equal;
    }
};

export const getLogo = () => {
    return defaultLogo;
};

export const escapeHTML = (s) => {
    if (s == null) {
        s = '';
    }
    return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

/**
 *
 * @param {*} newValue The value that is now being applied
 * @param {*} oldValue The previous value for comparison. eg. A status may only change to another status.
 * @param {*} rules The validations rules
 * @param {*} entityModel The data configuration model in the front end for this entity
 * @param {*} adding Flags if this is called from an Add Entity or an Edit Entity component. This specifies which custom rules needs to be checked
 * @returns
 */
export const checkValidity = (newValue, oldValue, rules, entityModel, adding) => {
    let reason = null;
    let isValid = true;

    if (!rules) {
        return { isValid: isValid, inValidReason: reason };
    }

    if (newValue === null || newValue === undefined || newValue === '') {
        if (rules.required) {
            return { isValid: false, inValidReason: 'Please provide a value' };
        } else {
            return { isValid: true, inValidReason: reason };
        }
    }

    if (rules.required) {
        const testValue = JSON.stringify(newValue).replace(/{|"|:|}|\s*/g, '');
        isValid = testValue !== '' && isValid;
        if (testValue == '') {
            reason = 'Please provide a value';
        }
    }

    /**
     * Check if this field must be equal to a certain value.
     * eg. Accept Terms and Conditions has to be true
     */
    if (rules.equalTo) {
        const testValue = rules.equalTo === newValue;
        isValid = testValue && isValid;
        if (!testValue) {
            reason = rules.equalToError ? rules.equalToError : 'Value needs to be ' + rules.equalTo;
        }
    }

    if (rules.minLength) {
        isValid = newValue.length >= rules.minLength && isValid;
        if (newValue.length < rules.minLength) {
            reason = 'Minimum length required is ' + rules.minLength;
        }
    }

    if (rules.maxLength) {
        isValid = newValue.length <= rules.maxLength && isValid;
        if (newValue.length > rules.minLength) {
            reason = 'Maximum length allowed is ' + rules.maxLength;
        }
    }

    if (rules.isEmail) {
        const pattern =
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        const testResult = pattern.test(newValue);
        isValid = testResult && isValid;
        if (!testResult) {
            reason = 'This is not a valid email address';
        }
    }

    if (rules.isNumeric) {
        const pattern = /^\d+$/;
        const testResult = pattern.test(newValue);
        isValid = testResult && isValid;
        if (!testResult) {
            reason = 'Not a valid number';
        }
    }

    if (rules.afterDate) {
        let key = rules.afterDate;
        let testResult = true;
        let compareField = null;
        if (entityModel && entityModel[key] && entityModel[key].value) {
            compareField = entityModel[key].displayName;
            testResult = new Date(newValue) > new Date(entityModel[key].value);
        } else {
            testResult = false;
            compareField = capitalFirst(key);
        }
        isValid = testResult && isValid;
        if (!testResult) {
            reason = 'This must be after ' + compareField;
        }
    }

    if (rules.afterOrEqualDate) {
        let key = rules.afterOrEqualDate;
        let testResult = true;
        let compareField = null;
        if (entityModel && entityModel[key] && entityModel[key].value) {
            compareField = entityModel[key].displayName;
            testResult = new Date(newValue) >= new Date(entityModel[key].value);
        } else {
            testResult = false;
            compareField = capitalFirst(key);
        }
        isValid = testResult && isValid;
        if (!testResult) {
            reason = 'This must be after or equal to ' + compareField;
        }
    }

    if (rules.beforeDate) {
        let key = rules.beforeDate;
        let testResult = true;
        let compareField = null;
        if (entityModel && entityModel[key] && entityModel[key].value) {
            compareField = entityModel[key].displayName;
            testResult = new Date(newValue) < new Date(entityModel[key].value);
        } else {
            testResult = false;
            compareField = capitalFirst(key);
        }
        isValid = testResult && isValid;
        if (!testResult) {
            reason = 'This must be before ' + compareField;
        }
    }

    if (rules.futureDate) {
        const testValue = new Date(newValue) > new Date();
        isValid = testValue && isValid;
        if (!testValue) {
            reason = 'Only future dates are allowed';
        }
    }

    if (rules.customAddRules && adding) {
        let testValue = true;
        //Loop through the custom rules and if one is false return that value
        for (let i = 0; i < rules.customAddRules.length; i++) {
            let test = rules.customAddRules[i](newValue, oldValue);
            if (test && !test.isValid) {
                testValue = test.isValid;
                reason = test.reason;
                break;
            }
        }
        isValid = testValue && isValid;
    }

    if (rules.customEditRules && (adding == null || !adding)) {
        let testValue = true;
        //Loop through the custom rules and if one is false return that value
        for (let i = 0; i < rules.customEditRules.length; i++) {
            let test = rules.customEditRules[i](newValue, oldValue);
            if (test && !test.isValid) {
                testValue = test.isValid;
                reason = test.reason;
                break;
            }
        }
        isValid = testValue && isValid;
    }

    return { isValid: isValid, inValidReason: reason };
};

export const lowerFirst = (str) => {
    return str.charAt(0).toLowerCase() + str.slice(1);
};

export const capitalFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1); //.toLowerCase();
};

export const extractInitials = (str) => {
    if (str && str !== null) {
        const elems = str.split(/[ ,]+/);
        const initials = elems.map((e) => {
            return e.charAt(0);
        });
        return initials.join('');
    }
    return '';
};

export const isNumber = (value) => {
    const pattern = /^\d+$/;
    return pattern.test(value);
};

export const isColour = (value) => {
    const pattern = /^#[0-9a-f]{6}$/i;
    return pattern.test(value);
};

export const findPositions = (lookingFor, lookingIn) => {
    const results = [];
    let p = 0;
    if (lookingFor && lookingFor !== '' && lookingIn && lookingIn !== '' && lookingIn.indexOf(lookingFor) >= 0) {
        p = lookingIn.indexOf(lookingFor);
        while (p >= 0) {
            results.push(p);
            if (p + 1 <= lookingIn.length) {
                p = lookingIn.indexOf(lookingFor, p + 1);
            } else {
                p = -1;
            }
        }
    }
    return results;
};

export const replaceAt = (stringValue, index, replacement) => {
    if (stringValue === undefined || index === undefined || replacement === undefined) {
        return stringValue;
    }
    return stringValue.substring(0, index) + replacement + stringValue.substring(index + replacement.length);
};

export const decodeToken = (_token) => {
    let base64Url = _token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
    );

    return JSON.parse(jsonPayload);
};

//Find the value of the dot notation as a string. eg. student.person.name is found when student is sent as object and person.name as string
//Used in Dropdown to change the display name if so required
export const getObjectValue = (obj, stringPath) => {
    if (
        obj &&
        obj !== undefined &&
        obj !== null &&
        typeof obj == 'object' &&
        stringPath &&
        stringPath !== undefined &&
        stringPath !== null &&
        stringPath !== ''
    ) {
        if (stringPath.indexOf('.') > 0) {
            return stringPath.split('.').reduce((o, i) => (o ? o[i] : null), obj);
        }
        //If there are no dots just return the reference
        return obj[stringPath];
    }
    return obj;
};

export const formatCurrency = (amount) => {
    let formatter = new Intl.NumberFormat(LOCALE, {
        //undefined, { //undefined = use browser's locale
        // style: 'currency',
        // currency: 'ZAR',
        minimumFractionDigits: 2, // always display 2 decimals
        maximumFractionDigits: 2 // don't display more than 2 decimals
    });

    if (!(amount == null)) {
        return formatter.format(amount);
    }

    return formatter.format(0.0);
};

export const containsIPaddress = (str) => {
    if (
        /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(
            str
        )
    ) {
        return true;
    }
    return false;
};
