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
import { UserAdminContext } from 'contexts/admin/UserAdminContext';
import FormItem from 'components/FormItem';
import { createMenuItemsFromEnum } from 'utils/enum-util';
import UserProfileApi from 'api/UserProfileApi';
import user_status from 'enum/user_status';
import role from 'enum/role';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { AuthContext } from 'hooks/auth-context';

export default () => {
    const { record, setRecord, records, setRecords, addRecord, ownProfile } = useContext(UserAdminContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const authContext = useContext(AuthContext);

    const api = new UserProfileApi();

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
                            firstname: Yup.string().required('Firstname is a mandatory field').max(255),
                            surname: Yup.string().required('Surname is a mandatory field').max(255),
                            contact_no: Yup.string().required('Contact Number is a mandatory field').max(255),
                            linked_user: Yup.object().shape({
                                email: Yup.string().required('Email Address is a mandatory field').max(255),
                                password: record && record.id ? null : Yup.string().required('Password is a mandatory field').max(255),
                                roles: Yup.array().required('Roles is a mandatory field').max(255),
                                user_status: Yup.string().required('Status is a mandatory field').max(255)
                            })
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                setSubmitting(true);
                                setErrorMessage(null);
                                setSuccessMessage(null);

                                delete values.key;
                                delete values.submit;

                                values.email = values.linked_user.email;
                                let result;
                                if (values.id) {
                                    if (ownProfile) {
                                        result = await api.updateOwn(values);
                                    } else {
                                        result = await api.update(values);
                                    }
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
                                                <FormItem field="linked_user.email" label="Email Address" touched={touched} errors={errors}>
                                                    <TextField
                                                        id="linked_user.email"
                                                        name="linked_user.email"
                                                        variant="outlined"
                                                        value={values.linked_user.email}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(
                                                            getIn(touched, 'linked_user.email') && getIn(errors, 'linked_user.email')
                                                        )}
                                                        inputProps={{
                                                            autoComplete: 'new-password' // disable autocomplete and autofill
                                                        }}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>

                                        {record && !record.id && (
                                            <Grid item xs={12}>
                                                <Stack spacing={1}>
                                                    <FormItem
                                                        field="linked_user.password"
                                                        label="Password"
                                                        touched={touched}
                                                        errors={errors}
                                                    >
                                                        <TextField
                                                            id="linked_user.password"
                                                            name="linked_user.password"
                                                            variant="outlined"
                                                            value={values.linked_user.password}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            fullWidth
                                                            error={Boolean(
                                                                getIn(touched, 'linked_user.password') &&
                                                                    getIn(errors, 'linked_user.password')
                                                            )}
                                                            inputProps={{
                                                                autoComplete: 'new-password' // disable autocomplete and autofill
                                                            }}
                                                        />
                                                    </FormItem>
                                                </Stack>
                                            </Grid>
                                        )}

                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="linked_user.roles" label="Roles" touched={touched} errors={errors}>
                                                    <Select
                                                        multiple
                                                        id="linked_user.roles"
                                                        name="linked_user.roles"
                                                        value={values.linked_user?.roles ? values.linked_user.roles : []}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.roles && errors.roles)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => (
                                                                    <Chip key={value} label={role.dictionary[value]} />
                                                                ))}
                                                            </Box>
                                                        )}
                                                    >
                                                        {createMenuItemsFromEnum(role)}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="linked_user.user_status" label="Status" touched={touched} errors={errors}>
                                                    <Select
                                                        id="linked_user.user_status"
                                                        name="linked_user.user_status"
                                                        value={values.linked_user.user_status}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.user_status && errors.user_status)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {<Chip key={selected} label={user_status.dictionary[selected]} />}
                                                            </Box>
                                                        )}
                                                    >
                                                        {createMenuItemsFromEnum(user_status)}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>

                                        {/* PROFILE */}

                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="firstname" label="Firstname" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="firstname"
                                                        label="Firstname"
                                                        value={values.firstname}
                                                        name="firstname"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'firstname') && getIn(errors, 'firstname'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="surname" label="Surname" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="surname"
                                                        label="Surname"
                                                        value={values.surname}
                                                        name="surname"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'surname') && getIn(errors, 'surname'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="contact_no" label="Contact Number" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="contact_no"
                                                        label="Contact Number"
                                                        value={values.contact_no}
                                                        name="contact_no"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'contact_no') && getIn(errors, 'contact_no'))}
                                                    />
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
