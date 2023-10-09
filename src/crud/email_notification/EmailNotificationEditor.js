import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import ValidationComponent from 'components/ValidationComponent';

import { useState, useContext, useEffect } from 'react';

import {
    Button,
    FormHelperText,
    Select,
    Grid,
    OutlinedInput,
    Stack,
    Modal,
    Chip,
    Box,
    TextField,
    CircularProgress,
    Autocomplete
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as Yup from 'yup';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { EmailNotificationContext } from 'contexts/EmailNotificationContext';
import FormItem from 'components/FormItem';
import { createMenuItemsFromEnum } from 'utils/enum-util';
import EmailNotificationApi from 'api/EmailNotificationApi';
import reader_types from 'enum/reader_types';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { AuthContext } from 'hooks/auth-context';

export default () => {
    const { record, setRecord, records, setRecords, addRecord } = useContext(EmailNotificationContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const authContext = useContext(AuthContext);

    const api = new EmailNotificationApi();

    let isAdmin = authContext.authData.roles.indexOf('admin') > -1;

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit User' : 'New User'}
                sx={{
                    width: '50%',
                    minWidth: '400px',
                    margin: '5% auto',
                    boxShadow: 24
                }}
            >
                <>
                    <Formik
                        initialValues={{
                            ...record,
                            submit: null
                        }}
                        validationSchema={Yup.object().shape({
                            email: Yup.string().email('Invalid email address').required('Email is required').max(255),
                            type: Yup.string().required('Type is required')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                setSubmitting(true);
                                setErrorMessage(null);
                                setSuccessMessage(null);

                                delete values.key;
                                delete values.submit;
                                let result;
                                if (values.id) {
                                    result = await api.update(values);
                                    setSuccessMessage('Record Updated Successfully.');
                                } else {
                                    result = await api.create(values);
                                    setSuccessMessage('Record Saved Successfully.');
                                }

                                result.data.key = result.data.id;

                                addRecord(result.data);
                                setRecord(null);

                                setStatus({ success: true });
                                setSubmitting(false);
                            } catch (err) {
                                setStatus({ success: false });
                                setErrors({ submit: err.message });
                                setErrorMessage(err.message);
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, validateForm, setTouched }) => {
                            const setTouchedRecursively = (errors, touched = {}) => {
                                Object.entries(errors).forEach(([key, value]) => {
                                    if (typeof value === 'object' && !Array.isArray(value)) {
                                        touched[key] = setTouchedRecursively(value, touched[key] || {});
                                    } else {
                                        touched[key] = true;
                                    }
                                });
                                return touched;
                            };

                            const handleSaveClick = async () => {
                                const formErrors = await validateForm();
                                setTouched(setTouchedRecursively(formErrors));
                                if (Object.keys(formErrors).length === 0) {
                                    handleSubmit();
                                }
                            };

                            if (errors) {
                                console.log('Validation Errors=', errors);
                            }
                            return (
                                <form noValidate onSubmit={handleSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Stack spacing={1}>
                                                <FormItem field="email" label="Email Address" touched={touched} errors={errors}>
                                                    <TextField
                                                        id="email"
                                                        name="email"
                                                        variant="outlined"
                                                        value={values.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'email') && getIn(errors, 'email'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="type" label="Type" touched={touched} errors={errors}>
                                                    <Select
                                                        id="type"
                                                        name="type"
                                                        value={values.type}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.type && errors.type)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <div></div>;
                                                            } else {
                                                                return (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        <Chip key={selected} label={reader_types.dictionary[selected]} />
                                                                    </Box>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {createMenuItemsFromEnum(reader_types)}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Stack spacing={1}>
                                                <FormItem field="update_time" label="Last Updated" touched={touched} errors={errors}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DateTimePicker
                                                            readOnly={true}
                                                            id="update_time"
                                                            value={values.update_time}
                                                            name="update_time"
                                                            onBlur={handleBlur}
                                                            onChange={(value) => {
                                                                handleChange({ target: { name: 'update_time', value: dayjs(value) } });
                                                            }}
                                                            error={Boolean(getIn(touched, 'update_time') && getIn(errors, 'update_time'))}
                                                        />
                                                    </LocalizationProvider>
                                                </FormItem>
                                            </Stack>
                                        </Grid>

                                        {errors.submit && (
                                            <Grid item xs={12}>
                                                <FormHelperText error>{errors.submit}</FormHelperText>
                                            </Grid>
                                        )}
                                        <Grid item xs={12}>
                                            <Button
                                                disableElevation
                                                disabled={isSubmitting}
                                                fullWidth
                                                size="large"
                                                type="button"
                                                onClick={handleSaveClick}
                                                variant="contained"
                                                color="primary"
                                                sx={{ letterSpacing: '2px' }}
                                            >
                                                SAVE
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </form>
                            );
                        }}
                    </Formik>
                </>
            </ModalCard>
        </Modal>
    );
};
