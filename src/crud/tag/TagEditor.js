import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import ValidationComponent from 'components/ValidationComponent';

import { useState, useContext, useEffect } from 'react';

import { Button, FormHelperText, Select, Grid, OutlinedInput, Stack, Modal, Chip, Box, MenuItem } from '@mui/material';
import * as yup from 'yup';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { TagContext } from 'contexts/tag/TagContext';
import FormItem from 'components/FormItem';
import TagApi from 'api/TagApi';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { AuthContext } from 'hooks/auth-context';

export default () => {
    const { record, setRecord, records, setRecords, addRecord } = useContext(TagContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const authContext = useContext(AuthContext);

    const api = new TagApi();

    const validationSchema = yup.object().shape({
        tag_id: yup
            .string()
            .required('Tag ID is required')
            .test('is-hex-and-length-24', 'Tag ID must be a 24 character hexadecimal string', (value) => {
                return value && value.length === 24 && /^[0-9a-fA-F]+$/.test(value);
            }),
        item_description: yup.string().required('Description is required')
    });

    let categories = _.uniq(records.map((r) => r.category));
    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit Tag' : 'New Tag'}
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
                        {({
                            errors,
                            handleBlur,
                            handleChange,
                            handleSubmit,
                            isSubmitting,
                            touched,
                            values,
                            validateForm,
                            setTouched,
                            setFieldValue
                        }) => {
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
                                                <FormItem field="tag_id" label="Tag ID" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="tag_id"
                                                        label="Tag ID"
                                                        value={values.tag_id}
                                                        name="tag_id"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'tag_id') && getIn(errors, 'tag_id'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="item_description" label="Desciption" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="item_description"
                                                        label="Description"
                                                        value={values.item_description}
                                                        name="item_description"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(
                                                            getIn(touched, 'item_description') && getIn(errors, 'item_description')
                                                        )}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="category" label="Category" touched={touched} errors={errors}>
                                                    <Select
                                                        id="category"
                                                        name="category"
                                                        value={values.category}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.category && errors.category)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <div></div>;
                                                            } else {
                                                                return (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        <Chip key={selected} label={selected} />
                                                                    </Box>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {Object.entries(categories).map(([key, value]) => (
                                                            <MenuItem value={value}>{value}</MenuItem>
                                                        ))}
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
