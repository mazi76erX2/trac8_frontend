import { useContext } from 'react';

import { Button, FormHelperText, Select, Grid, Stack, Modal, Chip, Box, TextField, MenuItem } from '@mui/material';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { LocationContext } from 'contexts/LocationContext';
import FormItem from 'components/FormItem';
import { createMenuItemsFromEnum } from 'utils/enum-util';
import LocationApi from 'api/LocationApi';
import location_types from 'enum/location_types';
import { SnackbarContext } from 'contexts/SnackbarContext';
import * as Yup from 'yup';
import { TokenContext } from 'contexts/TokenContext';

export default () => {
    const { record, setRecord, addRecord, records } = useContext(LocationContext);
    const tokenContext = useContext(TokenContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const api = new LocationApi();

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit Location' : 'New Location'}
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
                            name: Yup.string().required('Name is required').max(25),
                            description: Yup.string().max(200),
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
                                result.data.token = result.data.token?.id;

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
                                                <FormItem field="name" label="Name" touched={touched} errors={errors}>
                                                    <TextField
                                                        id="name"
                                                        name="name"
                                                        variant="outlined"
                                                        value={values.name}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'name') && getIn(errors, 'name'))}
                                                    />
                                                </FormItem>
                                                <FormItem field="description" label="Description" touched={touched} errors={errors}>
                                                    <TextField
                                                        id="description"
                                                        name="description"
                                                        variant="outlined"
                                                        value={values.description}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'description') && getIn(errors, 'description'))}
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
                                                                return null;
                                                            } else {
                                                                return (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        <Chip key={selected} label={location_types.dictionary[selected]} />
                                                                    </Box>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {createMenuItemsFromEnum(location_types)}
                                                    </Select>
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
