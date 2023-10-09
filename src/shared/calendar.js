import { isNumber } from './utility';

export const THIS_YEAR = +new Date().getFullYear();

export const THIS_MONTH = +new Date().getMonth() + 1;

export const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEK_DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CALENDAR_MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];
export const CALENDAR_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

export const CALENDAR_WEEKS = 6;

export const getDayName = (dayNumber, length = 0) => {
    if (isNumber(dayNumber) && dayNumber >= 0 && dayNumber < WEEK_DAYS.length) {
        if (length > 0) {
            return WEEK_DAYS[dayNumber].substring(0, length);
        }
        return WEEK_DAYS[dayNumber];
    }
    return 'Day';
};

export const getMonthName = (monthNumber) => {
    if (isNumber(monthNumber) && monthNumber >= 0 && monthNumber < CALENDAR_MONTHS.length) {
        return CALENDAR_MONTHS[monthNumber];
    }
    return 'Month';
};

export const getMonthShortName = (monthNumber) => {
    if (isNumber(monthNumber) && monthNumber >= 0 && monthNumber < CALENDAR_MONTHS_SHORT.length) {
        return CALENDAR_MONTHS_SHORT[monthNumber];
    }
    return 'Mnth';
};

export const getFirstDayOfWeek = (date = new Date()) => {
    if (!isDate(date)) return null;
    date.setDate(date.getDate() - date.getDay());
    return date;
};

//Date format YYYY-MM-DD
export const getDateString = (date = new Date()) => {
    if (!isDate(date)) return '';
    return [date.getFullYear(), zeroPad(+date.getMonth() + 1, 2), zeroPad(+date.getDate(), 2)].join('-');
};

//Time format HH:mm
export const getTimeString = (date = new Date()) => {
    if (!isDate(date)) return '';
    return [zeroPad(+date.getHours(), 2), zeroPad(+date.getMinutes(), 2)].join(':');
};

//Time format yyyy-MM-ddTHH:mm:ss.msZ eg.2021-02-17T10:00:00.000+02:00
export const getDateTimeString = (date = new Date()) => {
    if (!isDate(date)) return '';
    return (
        getDateString(date) +
        'T' +
        getTimeString(date) +
        ':' +
        zeroPad(+date.getSeconds(), 2) +
        '.' +
        zeroPad(+date.getMilliseconds(), 3) +
        (+date.getTimezoneOffset() <= 0 ? '+' : '-') +
        zeroPad(Math.abs(Math.floor(+date.getTimezoneOffset() / 60)), 2) +
        ':' +
        zeroPad(Math.abs(Math.floor(+date.getTimezoneOffset() % 60)), 2)
    );
};

//Time format yyyy-MM-dd HH:mm:ss eg.2021-02-17 10:00:00
export const getShortDateTimeString = (date = new Date()) => {
    if (!isDate(date)) return '';
    return getDateString(date) + ' ' + getTimeString(date) + ':' + zeroPad(+date.getSeconds(), 2);
};

export const zeroPad = (value, length = 2) => {
    if (isNumber(value) && value < 0) {
        return '-' + `${Math.abs(value)}`.padStart(length, '0');
    }
    return `${value}`.padStart(length, '0');
};

export const isLeapYear = (year) => {
    let leapYear = year % 400 === 0;

    if (!leapYear) {
        leapYear = year % 100 === 0;
        if (leapYear) {
            return false;
        } else {
            return year % 4 === 0;
        }
    }

    return true;
};

export const getMonthDays = (month = THIS_MONTH, year = THIS_YEAR) => {
    const months30 = [4, 6, 9, 11];
    const leapYear = isLeapYear(year);

    return month === 2 ? (leapYear ? 29 : 28) : months30.includes(month) ? 30 : 31;
};

export const differenceInDay = (date1, date2) => {
    if (date1 && date2) {
        // Set times as same
        let d1 = new Date(date1);
        let d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);

        // To calculate the time difference of two dates
        let Difference_In_Time = d1.getTime() - d2.getTime();

        // To calculate the no. of days between two dates
        return Difference_In_Time / (1000 * 60 * 60 * 24);
    }
    return null;
};

// // (int) First day of the month for a given year from 1 - 7
// // 1 => Sunday, 7 => Saturday
// export const getMonthFirstDay = (month = THIS_MONTH, year = THIS_YEAR) => {
// 	return +(new Date(`${year}-${zeroPad(month, 2)}-01`).getDay()) + 1;
// }

// (bool) Checks if a value is a date - this is just a simple check
export const isDate = (date) => {
    const isDate = Object.prototype.toString.call(date) === '[object Date]';
    const isValidDate = date && !Number.isNaN(date.valueOf());

    return isDate && isValidDate;
};

export const setToStartOfDay = (date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

export const setToEndOfDay = (date) => {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    return date;
};

export const setToStartOfMonth = (date) => {
    date.setDate(1);
    return date;
};

export const setToEndOfMonth = (date) => {
    //Have to set the date to another day than the last day of the month.
    //eg. 2021-10-31 + 1 month = 2021-11-30 and if you then set the date
    //to 0 its still at 2021-11-30 and not the expected 2021-10-31
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date;
};

export const getDateRangeText = (startDate, endDate) => {
    if (!isDate(startDate)) {
        startDate = new Date(startDate);
    }
    if (!isDate(endDate)) {
        endDate = new Date(endDate);
    }

    let s = startDate.getDate();

    if (startDate.getMonth() !== endDate.getMonth() || startDate.getFullYear() !== endDate.getFullYear()) {
        s = s + ' ' + getMonthShortName(startDate.getMonth());
    }

    if (startDate.getFullYear() !== endDate.getFullYear()) {
        s = s + ' ' + startDate.getFullYear();
    }

    s = s + '-' + endDate.getDate() + ' ' + getMonthShortName(endDate.getMonth()) + ' ' + endDate.getFullYear();

    return s;
};
