import { useContext } from 'react';

import { Button, FormHelperText, Select, Grid, OutlinedInput, Stack, Modal, Chip, Box, MenuItem } from '@mui/material';
import * as yup from 'yup';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { ItemCategoryContext } from 'contexts/item_category/ItemCategoryContext';
import FormItem from 'components/FormItem';
import ItemCategoryApi from 'api/ItemCategoryApi';
import { SnackbarContext } from 'contexts/SnackbarContext';

export default () => {
    const { record, setRecord, addRecord } = useContext(ItemCategoryContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const api = new ItemCategoryApi();

    const validationSchema = yup.object().shape({
        name: yup.string().required('Item Category is required'),
        description: yup.string().required('Description is required')
    });

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit Item Category' : 'New Item Category'}
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
                        validationSchema={validationSchema}
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
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="name" label="Item Category Name" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="name"
                                                        label="Item Category Name"
                                                        value={values.name}
                                                        name="name"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'name') && getIn(errors, 'name'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="description" label="Description" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="description"
                                                        label="Description"
                                                        value={values.description}
                                                        name="description"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'description') && getIn(errors, 'description'))}
                                                    />
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
