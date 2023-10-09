import { useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    IconButton,
    Button,
    FormHelperText,
    Select,
    Grid,
    Stack,
    Modal,
    MenuItem,
    TextField,
    Checkbox,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer
} from '@mui/material';
import { Formik, getIn } from 'formik';

import ModalCard from 'components/ModalCard';
import { TransitRouteContext } from 'contexts/TransitRouteContext';
import FormItem from 'components/FormItem';
import TransitRouteApi from 'api/TransitRouteApi';
import { SnackbarContext } from 'contexts/SnackbarContext';
import { LocationContext } from 'contexts/LocationContext';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import * as Yup from 'yup';

export default () => {
    const { record, setRecord, addRecord } = useContext(TransitRouteContext);
    const locationContext = useContext(LocationContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const api = new TransitRouteApi();

    return (
        <Modal
            sx={{
                overflow: 'auto'
            }}
            open={Boolean(record)}
            onClose={() => setRecord(null)}
        >
            <ModalCard
                title={record && record.id ? 'Edit TransitRoute' : 'New TransitRoute'}
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
                            start_location: record ? record.start_location : '',
                            end_location: record ? record.end_location : '',
                            waypoints: record && record.waypoints ? record.waypoints : [],
                            submit: null
                        }}
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required('Name is required').max(25),
                            description: Yup.string().max(200),
                            start_location: Yup.string().required('Start location is required'),
                            end_location: Yup.string().required('End location is required'),
                            waypoints: Yup.array()
                                .of(
                                    Yup.object().shape({
                                        location: Yup.string().nullable().required('Reader location is required for each waypoint')
                                    })
                                )
                                .required('At least one waypoint is required')
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
                                    result = await api.updateRecursive(values);
                                    setSuccessMessage('Record Updated Successfully.');
                                } else {
                                    result = await api.createRecursive(values);
                                    setSuccessMessage('Record Saved Successfully.');
                                }

                                result.data.key = result.data.id;
                                result.data.end_location = result.data.end_location.id;
                                result.data.start_location = result.data.start_location.id;

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
                            const addWaypoint = () => {
                                const newWaypoint = {
                                    id: uuidv4(),
                                    route_id: values.id,
                                    location: null,
                                    mandatory: true,
                                    index: values.waypoints?.length ? values.waypoints.length : 0
                                };
                                if (values.waypoints) {
                                    setFieldValue('waypoints', [...values.waypoints, newWaypoint]);
                                } else {
                                    setFieldValue('waypoints', [newWaypoint]);
                                }
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
                                                <FormItem field="start_location" label="Start Location" touched={touched} errors={errors}>
                                                    <Select
                                                        id="start_location"
                                                        name="start_location"
                                                        variant="outlined"
                                                        value={values.start_location}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'start_location') && getIn(errors, 'start_location'))}
                                                    >
                                                        {locationContext.records
                                                            .filter((l) => l.type == 'LOCATION')
                                                            .filter((l) => l.id != values.end_location)
                                                            .map((location) => (
                                                                <MenuItem key={location.id} value={location.id}>
                                                                    {location.name}
                                                                </MenuItem>
                                                            ))}
                                                    </Select>
                                                </FormItem>
                                                <div style={{ height: 'fit-content', width: '100%' }}>
                                                    <TableContainer component={Paper}>
                                                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Order</TableCell>
                                                                    <TableCell>Reader</TableCell>
                                                                    <TableCell>Mandatory</TableCell>
                                                                    <TableCell>Action</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {values.waypoints?.map((waypoint, index) => (
                                                                    <TableRow
                                                                        key={waypoint.id}
                                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                    >
                                                                        <TableCell>
                                                                            <IconButton
                                                                                style={{ margin: '0px 5px' }}
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    if (index > 0) {
                                                                                        const newWaypoints = [...values.waypoints];
                                                                                        const waypoint = newWaypoints.splice(index, 1)[0];
                                                                                        newWaypoints.splice(index - 1, 0, waypoint);
                                                                                        setFieldValue('waypoints', newWaypoints);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <ArrowUpwardIcon />
                                                                            </IconButton>
                                                                            <IconButton
                                                                                size="small"
                                                                                style={{ margin: '0px 5px' }}
                                                                                onClick={() => {
                                                                                    if (index < values.waypoints.length - 1) {
                                                                                        const newWaypoints = [...values.waypoints];
                                                                                        const waypoint = newWaypoints.splice(index, 1)[0];
                                                                                        newWaypoints.splice(index + 1, 0, waypoint);
                                                                                        setFieldValue('waypoints', newWaypoints);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <ArrowDownwardIcon />
                                                                            </IconButton>
                                                                        </TableCell>
                                                                        <TableCell style={{ width: '100%' }}>
                                                                            <Select
                                                                                id={'waypoints'}
                                                                                name={'waypoints'}
                                                                                variant="outlined"
                                                                                value={waypoint.location}
                                                                                onChange={(event) => {
                                                                                    let newWaypoints = [...values.waypoints];
                                                                                    newWaypoints[index].location = event.target.value;
                                                                                    setFieldValue('waypoints', newWaypoints);
                                                                                }}
                                                                                onBlur={handleBlur}
                                                                                fullWidth
                                                                                error={Boolean(
                                                                                    getIn(touched, 'waypoints') &&
                                                                                        getIn(errors, 'waypoints')
                                                                                )}
                                                                            >
                                                                                {locationContext.records
                                                                                    .filter((l) => l.type == 'READER')
                                                                                    .filter(
                                                                                        (l) =>
                                                                                            !values.waypoints
                                                                                                .map((w) => w.location)
                                                                                                .includes(l.id) || l.id == waypoint.location
                                                                                    )
                                                                                    .map((location) => (
                                                                                        <MenuItem key={location.id} value={location.id}>
                                                                                            {location.name}
                                                                                        </MenuItem>
                                                                                    ))}
                                                                            </Select>
                                                                            <FormHelperText error>
                                                                                {getIn(errors, `waypoints[${index}].location`)}
                                                                            </FormHelperText>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Checkbox
                                                                                checked={waypoint.mandatory}
                                                                                style={{ margin: '0px 5px' }}
                                                                                onChange={(e) => {
                                                                                    waypoint.mandatory = e.target.checked;
                                                                                    setFieldValue('waypoints', [...values.waypoints]);
                                                                                }}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <IconButton
                                                                                variant="contained"
                                                                                style={{ margin: '0px 5px' }}
                                                                                size="small"
                                                                                onClick={() => {
                                                                                    setFieldValue('waypoints', [
                                                                                        ...values.waypoints.filter(
                                                                                            (w) => w.id != waypoint.id
                                                                                        )
                                                                                    ]);
                                                                                }}
                                                                            >
                                                                                <DeleteIcon />
                                                                            </IconButton>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </div>
                                                <Button onClick={addWaypoint}>Add Waypoint</Button>
                                                <FormItem field="end_location" label="End Location" touched={touched} errors={errors}>
                                                    <Select
                                                        id="end_location"
                                                        name="end_location"
                                                        variant="outlined"
                                                        value={values.end_location}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth
                                                        error={Boolean(getIn(touched, 'end_location') && getIn(errors, 'end_location'))}
                                                    >
                                                        {locationContext.records
                                                            .filter((l) => l.type == 'LOCATION')
                                                            .filter((l) => l.id != values.start_location)
                                                            .map((location) => (
                                                                <MenuItem key={location.id} value={location.id}>
                                                                    {location.name}
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
