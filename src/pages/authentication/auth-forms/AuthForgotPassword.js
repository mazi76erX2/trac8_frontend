import { useEffect, useState, useContext } from 'react';

// material-ui
import { Button, FormHelperText, Grid, Link, OutlinedInput, Stack } from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { SnackbarContext } from 'contexts/SnackbarContext';

import UserProfileApi from 'api/UserProfileApi';

// ============================|| FIREBASE - REGISTER ||============================ //

const AuthForgotPassword = () => {
    const api = new UserProfileApi();
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    return (
        <>
            <Formik
                initialValues={{
                    email: ''
                }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Must be a valid email').max(255).required('Email is required')
                })}
                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                    try {
                        await api.forgotPassword(values.email);
                        setStatus({ success: true });
                        setSubmitting(false);
                        setSuccessMessage('Password reset link has been sent to your email.');
                    } catch (err) {
                        console.error(err);
                        if (err.response?.data) {
                            console.error(err.response?.data);
                            setErrors({ submit: err.response?.data });
                        } else {
                            setErrors({ submit: err.message });
                        }
                        setStatus({ success: false });
                        setSubmitting(false);
                    }
                }}
            >
                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                    <form noValidate onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Stack spacing={1}>
                                    <OutlinedInput
                                        fullWidth
                                        error={Boolean(touched.email && errors.email)}
                                        id="email-login"
                                        type="email"
                                        value={values.email}
                                        name="email"
                                        onBlur={handleBlur}
                                        placeholder="email address"
                                        onChange={handleChange}
                                        inputProps={{}}
                                    />
                                    {touched.email && errors.email && (
                                        <FormHelperText error id="helper-text-email-signup">
                                            {errors.email}
                                        </FormHelperText>
                                    )}
                                </Stack>
                            </Grid>
                            {errors.submit && (
                                <Grid item xs={12}>
                                    <FormHelperText error>{errors.submit}</FormHelperText>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <AnimateButton>
                                    <Button
                                        disableElevation
                                        disabled={isSubmitting}
                                        fullWidth
                                        size="large"
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Reset Password
                                    </Button>
                                </AnimateButton>
                            </Grid>
                            <Grid item xs={12}>
                                <AnimateButton>
                                    <Link href="/">
                                        <Button
                                            disableElevation
                                            disabled={isSubmitting}
                                            fullWidth
                                            size="large"
                                            variant="contained"
                                            color="primary"
                                        >
                                            Back
                                        </Button>
                                    </Link>
                                </AnimateButton>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    );
};

export default AuthForgotPassword;
