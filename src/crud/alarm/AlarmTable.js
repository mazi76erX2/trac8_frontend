import { useEffect, useState, useContext } from 'react';

import { Tooltip, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Switch, FormControlLabel } from '@mui/material';
import { useFormik } from 'formik';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';

import { AlarmContext } from 'contexts/alarm/AlarmContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import ReadEventApi from 'api/ReadEventApi';
import ReaderApi from 'api/ReaderApi';
import ExportButton from 'components/ExportButton';
import { Typography } from '@mui/material';

const AlarmTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(AlarmContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const [isLoading, setIsLoading] = useState(props.loading);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'activation_timestamp', sort: 'desc' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const readEventApi = new ReadEventApi();
    const readerApi = new ReaderApi();
    const [open, setOpen] = useState(false);
    const [currentAlarm, setCurrentAlarm] = useState(null);

    const formik = useFormik({
        initialValues: {
            securityComment: '',
            itemRecovered: ''
        },
        onSubmit: (values) => {
            handleClose();
            readerApi.disableAlarm(currentAlarm.reader_id);
            let event = currentAlarm;
            if ('key' in currentAlarm) {
                delete event.key;
            }
            event.deactivated = true;
            readEventApi.disableAlarmEvent(event, values);
            console.log(JSON.stringify(event));
        }
    });

    const handleClickOpen = (alarm) => {
        setCurrentAlarm(alarm);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        formik.resetForm();
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh((prevState) => !prevState);
    };

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await readEventApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await readEventApi.get({
                sortField: sort.field,
                sortMethod: sort.sort,
                pageSize,
                page: page + 1,
                searchQuery
            });

            setRecords(
                result.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let intervalId;
        if (autoRefresh) {
            intervalId = setInterval(() => {
                fetchRecords();
            }, 1000);
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchRecords, autoRefresh]);

    useEffect(() => {
        fetchRecords();
    }, [sortModel, filterModel, paginationModel]);

    let columns = [
        { field: 'location', headerName: 'Location', flex: 1 },
        { field: 'description', headerName: 'Item Description', flex: 1 },
        { field: 'tag_id', headerName: 'Tag ID', flex: 1 },
        { field: 'antenna_index', headerName: 'Antenna Index', flex: 1 },
        { field: 'activation_timestamp', headerName: 'Activation Timestamp', flex: 1 }
    ];

    if (!props.readOnly) {
        columns.push({
            headerName: 'Actions',
            renderCell: (params) => (
                <>
                    {!params.row.deactivated && (
                        <Tooltip title="Turn alarm off">
                            <IconButton variant="contained" size="small" onClick={() => handleClickOpen(params.row)}>
                                <AlarmOffIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </>
            )
        });
    }

    return (
        <div>
            <Typography sx={{ paddingTop: 5 }} variant="h4" gutterBottom>
                Alarm Events
            </Typography>
            <DataGrid
                rowCount={count}
                rows={records}
                columns={columns}
                autoHeight
                slots={{
                    toolbar: () => (
                        <GridToolbarContainer>
                            <GridToolbarQuickFilter />
                            <Button variant="contained" color={autoRefresh ? 'secondary' : 'primary'} onClick={toggleAutoRefresh}>
                                {autoRefresh ? 'Stop auto-refresh' : 'Start auto-refresh'}
                            </Button>
                            {autoRefresh ? (
                                <Tooltip title="Stop auto refresh first!">
                                    <div>
                                        <ExportButton disabled={true} />
                                    </div>
                                </Tooltip>
                            ) : (
                                <ExportButton recordApi={readEventApi} />
                            )}
                        </GridToolbarContainer>
                    )
                }}
                loading={isLoading}
                filterMode="server"
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 10 }
                    }
                }}
                paginationMode="server"
                pageSizeOptions={[10, 20, 50, 100]}
                onFilterModelChange={setFilterModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={setSortModel}
                checkboxSelection={props.multiSelect}
                rowSelectionModel={selectionModel}
                keepNonExistentRowsSelected
            />
            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={formik.handleSubmit}>
                    <DialogTitle>Disable Alarm</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            id="securityComment"
                            label="Security Comment"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            onChange={formik.handleChange}
                            value={formik.values.securityComment}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formik.values.itemRecovered}
                                    onChange={formik.handleChange}
                                    name="itemRecovered"
                                    color="primary"
                                />
                            }
                            label="Item Recovered"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Disable Alarm
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default AlarmTable;
