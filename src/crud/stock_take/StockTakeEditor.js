import { useState, useContext, useEffect } from 'react';

import { Button, FormHelperText, Select, Grid, OutlinedInput, Stack, Modal, Chip, Box, MenuItem } from '@mui/material';
import * as yup from 'yup';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { StockTakeContext } from 'contexts/stock_take/StockTakeContext';
import FormItem from 'components/FormItem';
import StockTakeApi from 'api/StockTakeApi';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { ItemCategoryContext } from 'contexts/item_category/ItemCategoryContext';
import { createMenuItemsFromEnum } from 'utils/enum-util';
import stock_take_status from 'enum/stock_take_status';

export default () => {
    const { record, setRecord, records, setRecords, addRecord } = useContext(StockTakeContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const itemCategoryContext = useContext(ItemCategoryContext);

    const api = new StockTakeApi();

    const validationSchema = yup.object().shape({
        name: yup.string().required('Name is required'),
        description: yup.string().required('Description is required'),
        stock_take_categories: yup
            .array()
            .min(1, 'At least one Stock Item Category is required')
            .required('At least one Stock Item Category is required')
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
                title={record && record.id ? 'Edit StockTake' : 'New StockTake'}
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
                                    result = await api.updateRecursive(values);
                                    setSuccessMessage('Record Updated Successfully.');
                                } else {
                                    result = await api.createRecursive(values);
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
                                                <FormItem field="name" label="Name" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="name"
                                                        label="Name"
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
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="stock_take_categories" label="Category" touched={touched} errors={errors}>
                                                    <Select
                                                        multiple
                                                        id="stock_take_categories"
                                                        name="stock_take_categories"
                                                        value={values.stock_take_categories ? values.stock_take_categories : []}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.stock_take_categories && errors.stock_take_categories)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {selected.map((value) => (
                                                                    <Chip
                                                                        key={value}
                                                                        label={itemCategoryContext.records
                                                                            .filter((x) => x.id > 0 && x.name && x.id === value)
                                                                            .map((x) => x.name)}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}
                                                    >
                                                        {itemCategoryContext.records.map((value) => (
                                                            <MenuItem key={value.key} value={value.id}>
                                                                {value.name}
                                                            </MenuItem>
                                                        ))}{' '}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="status" label="Status" touched={touched} errors={errors}>
                                                    <Select
                                                        id="status"
                                                        name="status"
                                                        value={values.status}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.status && errors.status)}
                                                        renderValue={(selected) => {
                                                            if (!selected) {
                                                                return <div></div>;
                                                            } else {
                                                                return (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        <Chip
                                                                            key={selected}
                                                                            label={stock_take_status.dictionary[selected]}
                                                                        />
                                                                    </Box>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {createMenuItemsFromEnum(stock_take_status)}
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
