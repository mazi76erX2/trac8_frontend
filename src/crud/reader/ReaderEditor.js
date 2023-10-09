import axios from 'axios-base';

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
    FormControl,
    FormGroup,
    FormControlLabel,
    Checkbox,
    MenuItem
} from '@mui/material';
import * as yup from 'yup';
import { Formik, getIn, ErrorMessage } from 'formik';

import ModalCard from 'components/ModalCard';
import { ReaderAdminContext } from 'contexts/admin/ReaderAdminContext';
import FormItem from 'components/FormItem';
import { createMenuItemsFromEnum } from 'utils/enum-util';
import ReaderProfileApi from 'api/ReaderApi';
import LocationApi from 'api/LocationApi';
import reader_types from 'enum/reader_types';
import { SnackbarContext } from 'contexts/SnackbarContext';

export default () => {
    const { record, setRecord, addRecord } = useContext(ReaderAdminContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const [locations, setLocations] = useState([]);

    const api = new ReaderProfileApi();
    const locationApi = new LocationApi();

    useEffect(() => {
        // Replace this with actual API call
        const fetchLocations = async () => {
            const response = await locationApi.all({});
            setLocations(response.data);
        };
        fetchLocations();
    }, []);

    const validationSchema = yup.object().shape({
        name: yup.string().required('Name is required'),
        IPAddress: yup
            .string()
            .required('IP Address is required')
            .matches(/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'IP Address is not valid'),
        antennaIndex: yup.string().required('Antenna Index is required'),
        type: yup.string().required('Type is required'),
        timeout: yup.number().required('Timeout is required'),
        maxTries: yup.number().required('Max Tries is required'),
        location: yup.string().required('Location is required'),
        postUrl: yup.string().url('Post URL is not valid').required('Post URL is required'),
        antennaLocations: yup
            .object()
            .nullable()
            .required('Antenna location is required')
            .test('antennaLocations-test', 'All checked antennas must have a corresponding location', function (obj, row) {
                const { antennaIndex } = row.parent;
                const indexes = antennaIndex.split('|').map(Number);
                for (let idx of indexes) {
                    if (!obj.hasOwnProperty(idx)) {
                        return false;
                    }
                }
                return true;
            })
            .test('unique-location-test', 'Each antenna must have a unique location', function (obj) {
                const locationValues = Object.values(obj);
                return locationValues.length === new Set(locationValues).size;
            })
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
                title={record && record.id ? 'Edit Reader' : 'New Reader'}
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
                            postUrl: record?.postUrl ? record.postUrl : `${axios.defaults.baseURL}reader/event`,
                            type: record?.type ? record.type : 'LOSS_PREVENTION',
                            timeout: record?.timeout ? record.timeout : 5000,
                            maxTries: record?.maxTries ? record.maxTries : 5,
                            antennaLocations: record?.antennaLocations
                                ? Object.entries(record.antennaLocations).reduce((obj, [key, value]) => {
                                      obj[key] = value?.id;
                                      return obj;
                                  }, {})
                                : {},
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
                            const handleCheckboxChange = (event, num) => {
                                let antennaIndex = values.antennaIndex;
                                let antennaLocations = values.antennaLocations;
                                if (!antennaIndex) {
                                    antennaIndex = '';
                                }
                                if (!antennaLocations) {
                                    antennaLocations = {};
                                }
                                const set = new Set(antennaIndex.split('|').map(Number));
                                if (event.target.checked) {
                                    set.add(num);
                                } else {
                                    set.delete(num);
                                    delete antennaLocations[num];
                                }
                                const sortedArray = Array.from(set)
                                    .sort((a, b) => a - b)
                                    .filter((n) => n != 0);
                                let newAntennaLocations = Object.fromEntries(sortedArray.map((key) => [key, antennaLocations[key]]));

                                setFieldValue('antennaLocations', newAntennaLocations);
                                setFieldValue('antennaIndex', sortedArray.join('|'));
                            };

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
                                const errorsString = JSON.stringify(formErrors);
                                setTouched(setTouchedRecursively(formErrors));
                                if (
                                    Object.keys(formErrors).length === 0 &&
                                    !errorsString.includes('All checked antennas must have a corresponding location')
                                ) {
                                    values.antennaLocations = Object.entries(values.antennaLocations).reduce((obj, [key, id]) => {
                                        let location = locations.find((l) => l.id === id);
                                        if (location) {
                                            obj[key] = location;
                                        }
                                        return obj;
                                    }, {});
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
                                                <FormItem field="location" label="Location" touched={touched} errors={errors}>
                                                    <Select
                                                        id={`location`}
                                                        name={`location`}
                                                        value={values.location}
                                                        onChange={handleChange}
                                                        variant="outlined"
                                                        onBlur={handleBlur}
                                                        error={Boolean(
                                                            getIn(touched, `antennaLocations`) && getIn(errors, `antennaLocations`)
                                                        )}
                                                        sx={{ marginRight: 2 }}
                                                    >
                                                        {locations
                                                            .filter((location) => location.type == 'LOCATION')
                                                            .map((location) => (
                                                                <MenuItem key={location.id} value={location.name}>
                                                                    {location.name}
                                                                </MenuItem>
                                                            ))}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="IPAddress" label="IPv4 Address" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="IPAddress"
                                                        label="IPAddress"
                                                        value={values.IPAddress}
                                                        name="IPAddress"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'IPAddress') && getIn(errors, 'IPAddress'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="antennaIndex" label="Antenna Index" touched={touched} errors={errors}>
                                                    <FormControl>
                                                        <FormGroup row>
                                                            {Array.from({ length: 4 }, (_, i) => i + 1).map((num) => (
                                                                <Box key={num} sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <FormControlLabel
                                                                        control={
                                                                            <Checkbox
                                                                                checked={values.antennaIndex?.includes(num.toString())}
                                                                                onChange={(e) => handleCheckboxChange(e, num)}
                                                                                name="antennaIndex"
                                                                                value={num.toString()}
                                                                            />
                                                                        }
                                                                        label={num}
                                                                    />
                                                                    {values.antennaIndex?.includes(num.toString()) && (
                                                                        <Select
                                                                            id={`antennaLocations.${num}`}
                                                                            name={`antennaLocations.${num}`}
                                                                            value={values.antennaLocations?.[num]}
                                                                            onChange={handleChange}
                                                                            variant="outlined"
                                                                            onBlur={handleBlur}
                                                                            error={Boolean(
                                                                                getIn(touched, `antennaLocations`) &&
                                                                                    getIn(errors, `antennaLocations`)
                                                                            )}
                                                                            sx={{ marginRight: 2 }}
                                                                        >
                                                                            {locations
                                                                                .filter((location) => location.type == 'READER')
                                                                                .filter((location) => {
                                                                                    if (values.antennaLocations[num] == location.id) {
                                                                                        return true;
                                                                                    }
                                                                                    return !Object.values(
                                                                                        values.antennaLocations || {}
                                                                                    ).includes(location.id);
                                                                                })
                                                                                .map((location) => (
                                                                                    <MenuItem key={location.id} value={location.id}>
                                                                                        {location.name}
                                                                                    </MenuItem>
                                                                                ))}
                                                                        </Select>
                                                                    )}
                                                                </Box>
                                                            ))}
                                                        </FormGroup>
                                                        <FormHelperText error>{errors.antennaLocations}</FormHelperText>
                                                    </FormControl>
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
                                                                return <div></div>;
                                                            } else {
                                                                return (
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                        <Chip key={selected} label={reader_types.dictionary[selected]} />
                                                                    </Box>
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        {createMenuItemsFromEnum(reader_types)}
                                                    </Select>
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem
                                                    field="timeout"
                                                    label="Alarm Timeout (milliseconds)"
                                                    touched={touched}
                                                    errors={errors}
                                                >
                                                    <OutlinedInput
                                                        id="timeout"
                                                        label="Alarm Timeout"
                                                        value={values.timeout}
                                                        name="timeout"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        InputLabelProps={{
                                                            shrink: true
                                                        }}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'timeout') && getIn(errors, 'timeout'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="maxTries" label="Max Connect Attempts" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="maxTries"
                                                        label="Max Connect Attempts"
                                                        value={values.maxTries}
                                                        name="maxTries"
                                                        type="number"
                                                        inputProps={{ min: 1 }}
                                                        InputLabelProps={{
                                                            shrink: true
                                                        }}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'maxTries') && getIn(errors, 'maxTries'))}
                                                    />
                                                </FormItem>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Stack spacing={1}>
                                                <FormItem field="postUrl" label="POST URL" touched={touched} errors={errors}>
                                                    <OutlinedInput
                                                        id="postUrl"
                                                        label="postUrl"
                                                        value={values.postUrl}
                                                        name="postUrl"
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'postUrl') && getIn(errors, 'postUrl'))}
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
