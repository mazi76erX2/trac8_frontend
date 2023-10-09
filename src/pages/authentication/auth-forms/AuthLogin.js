import React, { useState, useEffect } from 'react';
import axios from '../../../axios-base';

// material-ui
import { Button, FormHelperText, Grid, Link as MuiLink, OutlinedInput, Stack } from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';

// assets
import { AuthContext } from 'hooks/auth-context';

const AuthLogin = (props) => {
    const authContext = React.useContext(AuthContext);
    const [redirect, setRedirect] = useState(false);

    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    useEffect(() => {
        if (props.authRedirectPath !== '/') {
            // props.onSetAuthRedirectPath();
        }
        if (!authContext.authData.isAuth) {
        } else {
            setRedirect(true);
        }
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ margin: 'auto' }}>
                <Formik
                    style={{ display: 'flex' }}
                    initialValues={{
                        email: 'some@email.com',
                        password: 'password',
                        submit: null
                    }}
                    validationSchema={Yup.object().shape({
                        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
                        password: Yup.string().max(255).required('Password is required')
                    })}
                    onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                        try {
                            setSubmitting(true);
                            const entity = {
                                name: values.email,
                                password: values.password
                            };

                            const res = await axios.post('/authenticate', entity);
                            authContext.login(res.data);

                            setStatus({ success: true });
                            setSubmitting(false);
                        } catch (err) {
                            setStatus({ success: false });
                            setErrors({ submit: err.response?.data || err.message });
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
                                            id="email-login"
                                            type="email"
                                            value={values.email}
                                            name="email"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Username"
                                            fullWidth
                                            error={Boolean(touched.email && errors.email)}
                                        />
                                        {touched.email && errors.email && (
                                            <FormHelperText error id="standard-weight-helper-text-email-login">
                                                {errors.email}
                                            </FormHelperText>
                                        )}
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Stack spacing={1}>
                                        <OutlinedInput
                                            fullWidth
                                            error={Boolean(touched.password && errors.password)}
                                            id="-password-login"
                                            type={showPassword ? 'text' : 'password'}
                                            value={values.password}
                                            name="password"
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            placeholder="Enter password"
                                        />
                                        {touched.password && errors.password && (
                                            <FormHelperText error id="standard-weight-helper-text-password-login">
                                                {errors.password}
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
                                            sx={{ letterSpacing: '2px', width: '100%' }}
                                        >
                                            LOG IN
                                        </Button>
                                    </AnimateButton>
                                </Grid>
                                <Grid item xs={12}>
                                    <AnimateButton>
                                        <MuiLink
                                            href="/forgot-password"
                                            variant="body2"
                                            underline="none"
                                            sx={{ color: 'white', margin: '20px auto' }}
                                        >
                                            <Button sx={{ color: 'white', width: '100%' }}>Forgot Password?</Button>
                                        </MuiLink>
                                    </AnimateButton>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default AuthLogin;
