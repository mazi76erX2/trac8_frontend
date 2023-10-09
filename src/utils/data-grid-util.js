import dayjs from 'dayjs';

const ValueFormatters = {
    Number:
        ({ leftSymbol = null, rightSymbol = null, decimalPlaces = null }) =>
        (params) => {
            if (params.value == null) {
                return '';
            }
            let number = Number(params.value);
            if (decimalPlaces) {
                number = number.toFixed(decimalPlaces);
            }
            let output = leftSymbol ? leftSymbol : '';
            output += number;
            output += rightSymbol ? rightSymbol : '';
            return output;
        }
};

const ValueGetters = {
    DateTime: (field) => {
        return (params) => {
            if (!params && !params.row) {
                return '';
            }
            const value = params.row[field];
            if (!value) return null;
            if (dayjs.isDayjs(value)) return value.toDate();
            return dayjs(value).toDate();
        };
    }
};

export { ValueFormatters, ValueGetters };
