import { PropTypes } from 'prop-types';
import { FormHelperText, InputLabel } from '@mui/material';

const FormItem = (props) => {
    const fieldArr = props.field.split('.');
    let touched = props.touched[fieldArr[0]];
    let errors = props.errors[fieldArr[0]];
    touched = touched ? touched : [];
    errors = errors ? errors : [];

    if (fieldArr.length > 1) {
        for (let i = 1; i < fieldArr.length; i++) {
            touched = touched[fieldArr[i]];
            errors = errors[fieldArr[i]];
        }
    }

    return (
        <>
            <InputLabel htmlFor={props.field}>{props.label}</InputLabel>
            {props.children}
            {touched && errors && (
                <FormHelperText error id={`standard-weight-helper-text-${props.field}`}>
                    {errors}
                </FormHelperText>
            )}
        </>
    );
};

FormItem.propTypes = {
    field: PropTypes.string,
    label: PropTypes.string,
    touched: PropTypes.object,
    errors: PropTypes.object,
    children: PropTypes.node
};

export default FormItem;
