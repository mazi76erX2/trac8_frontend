import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const dateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z|[\w, ]+\d{2}:\d{2}:\d{2} GMT)$/;

function convertDateStringsToDayjs(obj) {
    if (typeof obj === 'string' && dateRegex.test(obj)) {
        return dayjs.utc(obj);
    }

    if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                obj[key] = convertDateStringsToDayjs(obj[key]);
            }
        }
    }
    return obj;
}

function convertDayjsToDateStrings(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            if (dayjs.isDayjs(obj[key])) {
                obj[key] = dayjs.utc(obj[key]).toISOString();
            } else {
                convertDayjsToDateStrings(obj[key]);
            }
        }
    }
}

export { convertDateStringsToDayjs, convertDayjsToDateStrings };
