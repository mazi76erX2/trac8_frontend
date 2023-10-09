import { useState, useContext, useEffect } from 'react';

import { Button, FormHelperText, Select, Grid, OutlinedInput, Stack, Modal, Chip, Box, MenuItem } from '@mui/material';
import * as yup from 'yup';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { ItemTypeContext } from 'contexts/item_type/ItemTypeContext';
import { ItemCategoryContext } from 'contexts/item_category/ItemCategoryContext';
import FormItem from 'components/FormItem';
import ItemTypeApi from 'api/ItemTypeApi';
import ItemCategoryApi from 'api/ItemCategoryApi';
import { SnackbarContext } from 'contexts/SnackbarContext';

export default () => {
    const itemCaterogyContext = useContext(ItemCategoryContext);
    const { addRecord, record, setRecord } = useContext(ItemTypeContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [filterModel] = useState({ quickFilterValues: [] });

    const apiType = new ItemTypeApi();
    const apiCategory = new ItemCategoryApi();

    const validationSchema = yup.object().shape({
        name: yup.string().required('Tag Name is required'),
        description: yup.string().required('Description is required'),
        category: yup.string().required('Category is required')
    });

    const fetchRecords = async () => {
        const { quickFilterValues } = filterModel;
        const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];
        const resultCategory = await apiCategory.get({
            searchQuery
        });

        resultCategory.data = resultCategory.data.map((x) => {
            x.key = x.id;
            return x;
        });
        itemCaterogyContext.setRecords(resultCategory.data);
    };

    useEffect(() => {
        fetchRecords();
    }, [filterModel]);

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit Tag Type' : 'New Tag Type'}
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

                                const valuesItemType = { ...values, category: parseInt(values.category) };

                                let result;
                                if (values.id) {
                                    result = await apiType.update(valuesItemType);
                                    setSuccessMessage('Record Updated Successfully.');
                                } else {
                                    result = await apiType.create(valuesItemType);
                                    setSuccessMessage('Record Saved Successfully.');
                                }

                                result.data.key = result.data.id;
                                result.data.category = result.data.category.id;

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
                                                <FormItem field="name" label="Tag Type Name" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="name"
                                                        label="Tag Type Name"
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
                                                <FormItem field="category" label="Item Category" touched={touched} errors={errors}>
                                                    <Select
                                                        id="category"
                                                        name="category"
                                                        value={values.category}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={Boolean(touched.category && errors.category)}
                                                        renderValue={(selected) => (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {
                                                                    <Chip
                                                                        key={selected - 1}
                                                                        label={itemCaterogyContext.records[selected - 1].name}
                                                                    />
                                                                }
                                                            </Box>
                                                        )}
                                                    >
                                                        {itemCaterogyContext.records.map((value) => (
                                                            <MenuItem key={value.key} value={value.id}>
                                                                {value.name}
                                                            </MenuItem>
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
