import { useState, useContext, useEffect } from 'react';
import axios from 'axios-base';

import { Button, FormHelperText, Grid, OutlinedInput, Stack, Modal, Typography } from '@mui/material';
import * as Yup from 'yup';
import { Formik, getIn } from 'formik';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

import ModalCard from 'components/ModalCard';
import { PasswordContext } from 'contexts/user/PasswordContext';
import UserProfileApi from 'api/UserProfileApi';
import { SnackbarContext } from 'contexts/SnackbarContext';

export default () => {
    const api = new UserProfileApi();
    const { record, setRecord, addRecord } = useContext(PasswordContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);
    const [level, setLevel] = useState();

    const changePassword = (value) => {
        const temp = strengthIndicator(value);
        setLevel(strengthColor(temp));
    };

    useEffect(() => {
        changePassword('');
    }, []);

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Change User Password' : 'New Password'}
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
                            old_password: '',
                            new_password: '',
                            confirm_password: '',
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
                            }),
                            old_password: Yup.string().required('Old password is a mandatory field').max(255),
                            new_password: Yup.string().required('New password is a mandatory field').max(255),
                            confirm_password: Yup.string()
                                .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
                                .required('Confirm New Password is a mandatory field')
                        })}
                        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                            try {
                                setSubmitting(true);
                                setErrorMessage(null);
                                setSuccessMessage(null);

                                const entity = {
                                    name: values.email,
                                    password: values.old_password
                                };

                                await axios.post('/authenticate', entity);

                                values.linked_user.password = values.new_password;

                                delete values.key;
                                delete values.submit;
                                delete values.old_password;
                                delete values.new_password;
                                delete values.confirm_password;

                                values.email = values.linked_user.email;
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
                                setErrors({ submit: err.response?.data || err.message });
                                setErrorMessage(err.response?.data || err.message);
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
                                            <OutlinedInput
                                                fullWidth
                                                error={Boolean(touched.old_password && errors.old_password)}
                                                id="old_password-login"
                                                type="password"
                                                value={values.old_password}
                                                name="old_password"
                                                onBlur={handleBlur}
                                                placeholder="Old Password"
                                                onChange={handleChange}
                                                disabled={isResetSuccessful}
                                            />
                                            {touched.old_password && errors.old_password && (
                                                <FormHelperText error id="helper-text-old_password-login">
                                                    {errors.old_password}
                                                </FormHelperText>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <OutlinedInput
                                                fullWidth
                                                error={Boolean(touched.new_password && errors.new_password)}
                                                id="new_password-login"
                                                type="password"
                                                value={values.new_password}
                                                name="new_password"
                                                onBlur={handleBlur}
                                                placeholder="New Password"
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    changePassword(e.target.value);
                                                }}
                                                disabled={isResetSuccessful}
                                            />
                                            <Typography
                                                variant="caption"
                                                component="div"
                                                color={level?.color}
                                                style={{ background: 'wheat' }}
                                            >
                                                Password strength: {level?.label}
                                            </Typography>
                                            {touched.new_password && errors.new_password && (
                                                <FormHelperText error id="helper-text-new_password-login">
                                                    {errors.new_password}
                                                </FormHelperText>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <OutlinedInput
                                                fullWidth
                                                error={Boolean(touched.confirm_password && errors.confirm_password)}
                                                id="confirm_password-login"
                                                type="password"
                                                value={values.confirm_password}
                                                name="confirm_password"
                                                onBlur={handleBlur}
                                                placeholder="Confirm Password"
                                                onChange={handleChange}
                                                disabled={isResetSuccessful}
                                            />
                                            {touched.confirm_password && errors.confirm_password && (
                                                <FormHelperText error id="helper-text-confirm_password-login">
                                                    {errors.confirm_password}
                                                </FormHelperText>
                                            )}
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
