import PropTypes from 'prop-types';
import { Switch, Grid, OutlinedInput, Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import FormItem from 'components/FormItem';

const ValidationComponent = (props) => {
    const { values, handleBlur, handleChange, touched, errors } = props;
    return (
        <>
            <Grid item xs={2}>
                <Stack spacing={1}>
                    <FormItem field="validated" label="Validated" touched={touched} errors={errors}>
                        <Switch
                            id="validated"
                            name="validated"
                            defaultChecked={false}
                            checked={values.validated}
                            onBlur={handleBlur}
                            onChange={(event) => {
                                // Don't allow invalidation.
                                // There are only two cases where the state of validation can be modified using this switch:
                                // 1 - the record is not yet validated (we can validate it)
                                // 2 - the validation_time has not yet been set and saved to the db, i.e. check and uncheck before saving.
                                const { checked } = event.target;
                                const shouldAllowValidationStatusChange = checked || !values.validation_time;
                                if (shouldAllowValidationStatusChange) {
                                    handleChange(event);
                                }
                            }}
                            label="validated"
                            fullWidth
                            error={Boolean(touched.validated && errors.validated)}
                        />
                    </FormItem>
                </Stack>
            </Grid>

            {values.validated && values.validation_time && values.validated_by ? (
                <>
                    <Grid item xs={12} md={5}>
                        <Stack spacing={1}>
                            <FormItem field="validation_time" label="Validation Time" touched={touched} errors={errors}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        sx={{ fontWeight: 'bold' }}
                                        id="validation_time"
                                        label="validation_time"
                                        name="validation_time"
                                        disabled
                                        value={values.validation_time}
                                        onBlur={handleBlur}
                                        error={Boolean(touched.validation_time && errors.validation_time)}
                                        onChange={(value) => handleChange({ target: { name: 'validation_time', value } })}
                                    />
                                </LocalizationProvider>
                            </FormItem>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Stack spacing={1}>
                            <FormItem field="validated_by_id" label="Validated By" touched={touched} errors={errors}>
                                <OutlinedInput
                                    id="validated_by_id"
                                    label="Validated By"
                                    disabled
                                    value={values.validated_by?.email}
                                    name="validated_by_id"
                                    onBlur={handleBlur}
                                    onChange={handleChange}
                                    fullWidth
                                    error={Boolean(touched.validated_by_id && errors.validated_by_id)}
                                />
                            </FormItem>
                        </Stack>
                    </Grid>
                </>
            ) : (
                ''
            )}
        </>
    );
};

ValidationComponent.propTypes = {
    values: PropTypes.object,
    handleBlur: PropTypes.func,
    handleChange: PropTypes.func,
    touched: PropTypes.object,
    errors: PropTypes.object
};

export default ValidationComponent;
