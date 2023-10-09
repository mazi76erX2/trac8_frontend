import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import {
    Box,
    Button,
    Divider,
    FormControl,
    FormHelperText,
    Grid,
    Link,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography
} from '@mui/material';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import FirebaseSocial from './FirebaseSocial';
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';
import { SnackbarContext } from 'contexts/SnackbarContext';

// assets
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import UserProfileApi from 'api/UserProfileApi';

// ============================|| FIREBASE - REGISTER ||============================ //

const AuthResetPassword = () => {
    const api = new UserProfileApi();
    const location = useLocation(); // This line gets the current location
    const currentPath = location.pathname;
    const [level, setLevel] = useState();
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const [isResetSuccessful, setIsResetSuccessful] = useState(false);

    const changePassword = (value) => {
        const temp = strengthIndicator(value);
        setLevel(strengthColor(temp));
    };

    useEffect(() => {
        changePassword('');
    }, []);

    return (
        <Formik
            initialValues={{
                new_password: '',
                new_duplicate: ''
            }}
            validationSchema={Yup.object().shape({
                new_password: Yup.string().max(255).required('New Password is required'),
                new_duplicate: Yup.string().oneOf([Yup.ref('new_password'), null], 'Passwords must match')
            })}
            onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                try {
                    let token = currentPath.substring(currentPath.lastIndexOf('/') + 1);
                    await api.resetPassword(values, token);
                    setStatus({ success: true });
                    setSuccessMessage('Password reset successful.');
                    setIsResetSuccessful(true);
                    setSubmitting(false);
                } catch (err) {
                    console.error(err);
                    setStatus({ success: false });
                    setErrors({ submit: err.response?.data || err.message });
                    setErrorMessage(err.response?.data || err.message);
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
                                {touched.new_password && errors.new_password && (
                                    <FormHelperText error id="helper-text-new_password-login">
                                        {errors.new_password}
                                    </FormHelperText>
                                )}
                            </Stack>
                            <Typography variant="caption" component="div" color={level?.color} style={{ background: 'wheat' }}>
                                Password strength: {level?.label}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <OutlinedInput
                                    fullWidth
                                    error={Boolean(touched.new_duplicate && errors.new_duplicate)}
                                    id="new_duplicate-login"
                                    type="password"
                                    value={values.new_duplicate}
                                    name="new_duplicate"
                                    onBlur={handleBlur}
                                    placeholder="Confirm Password"
                                    onChange={handleChange}
                                    disabled={isResetSuccessful}
                                />
                                {touched.new_duplicate && errors.new_duplicate && (
                                    <FormHelperText error id="helper-text-new_duplicate-login">
                                        {errors.new_duplicate}
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
                            {isResetSuccessful ? (
                                <Link href="/">
                                    <Button disableElevation fullWidth size="large" variant="contained" color="primary">
                                        Back
                                    </Button>
                                </Link>
                            ) : (
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
                            )}
                        </Grid>
                    </Grid>
                </form>
            )}
        </Formik>
    );
};

export default AuthResetPassword;
