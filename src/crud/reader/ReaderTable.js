import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SignalWifiConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiConnectedNoInternet4';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

import { ReaderAdminContext } from 'contexts/admin/ReaderAdminContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import ReaderApi from 'api/ReaderApi';

const ReaderTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(ReaderAdminContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState(props.selection ? props.selection : []);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [connectingReaders, setConnectingReaders] = useState([]);
    const readerApi = new ReaderApi();

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await readerApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await readerApi.get({
                sortField: sort.field,
                sortMethod: sort.sort,
                pageSize,
                page: page + 1,
                searchQuery
            });

            for (let readerIndex in result.data) {
                let reader = result.data[readerIndex];
                let connected = await readerApi.isConnected(reader);
                reader['connected'] = connected;
                result.data[readerIndex] = reader;
            }

            setRecords(
                result.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );
        } catch (error) {
            setErrorMessage('Could not load readers! Check Reader API');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            fetchRecords();
        } catch (error) {
            setErrorMessage('Could not load readers! Check Reader API');
        }
    }, [sortModel, filterModel, paginationModel]);

    const onClickNew = async (e) => {
        e.preventDefault();
        setRecord({ id: null });
    };

    const onEdit = async (record) => {
        setRecord(record);
    };

    const handleCloseDeletePopup = async () => {
        try {
            await readerApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete reader!');
        }
    };

    let columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'location', headerName: 'Location', flex: 1 },
        { field: 'type', headerName: 'Type', flex: 1 },
        { field: 'timeout', headerName: 'Timeout', flex: 1 },
        { field: 'IPAddress', headerName: 'IPv4 Address', flex: 1 },
        { field: 'antennaIndex', headerName: 'Antenna Index', flex: 1 },
        { field: 'maxTries', headerName: 'Max Connect Attempts', flex: 1 },
        { field: 'postUrl', headerName: 'Post URL', flex: 1 },
        {
            headerName: 'Reader Connection',
            field: 'connected',
            renderCell: (params) => (
                <>
                    {connectingReaders.includes(params.row.id) && (
                        <Tooltip title="Checking...">
                            <SettingsEthernetIcon />
                        </Tooltip>
                    )}
                    {!params.row.connected && !connectingReaders.includes(params.row.id) && (
                        <Tooltip title="Connect Reader">
                            <IconButton variant="contained" size="small">
                                <SignalWifiConnectedNoInternet4Icon
                                    onClick={async () => {
                                        try {
                                            setConnectingReaders([...connectingReaders, params.row.id]);
                                            let response = await readerApi.connect(params.row);
                                            let message = response.data;
                                            setSuccessMessage(message);
                                            fetchRecords();
                                        } catch (error) {
                                            setErrorMessage('Could not connect reader!');
                                        } finally {
                                            setConnectingReaders(connectingReaders.filter((i) => i != params.row.id));
                                        }
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    )}
                    {params.row.connected && !connectingReaders.includes(params.row.id) && (
                        <Tooltip title="Disconnect Reader">
                            <IconButton variant="contained" size="small">
                                <SignalWifi4BarIcon
                                    onClick={async () => {
                                        try {
                                            setConnectingReaders([...connectingReaders, params.row.id]);
                                            let response = await readerApi.disconnect(params.row);
                                            let message = response.data;
                                            setSuccessMessage(message);
                                            fetchRecords();
                                        } catch (error) {
                                            setErrorMessage('Could not disconnect reader!');
                                        } finally {
                                            setConnectingReaders(connectingReaders.filter((i) => i != params.row.id));
                                        }
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    )}
                </>
            ),
            flex: 1
        }
    ];

    if (!props.readOnly) {
        columns.push({
            headerName: 'Actions',
            renderCell: (params) => (
                <>
                    <IconButton variant="contained" size="small">
                        <EditIcon onClick={() => onEdit(params.row)} />
                    </IconButton>
                    <IconButton variant="contained" size="small">
                        <Dialog
                            open={itemToDelete}
                            onClose={handleCloseDeletePopup}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">{`Are you sure you want to delete ${
                                itemToDelete ? itemToDelete['name'] : null
                            }?`}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    This action is not reversable, are you sure you want to delete{' '}
                                    {itemToDelete ? itemToDelete['name'] : null}?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={() => {
                                        setItemToDelete(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleCloseDeletePopup}>Yes</Button>
                            </DialogActions>
                        </Dialog>
                        <DeleteIcon
                            onClick={() => {
                                setItemToDelete(params.row);
                            }}
                        />
                    </IconButton>
                </>
            )
        });
    }

    return (
        <DataGrid
            rowCount={count}
            rows={records}
            columns={columns}
            autoHeight
            slots={{
                toolbar: () => (
                    <GridToolbarContainer>
                        <GridToolbarQuickFilter />
                        {props.readOnly ? null : (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ letterSpacing: '2px', float: 'right' }}
                                    onClick={onClickNew}
                                >
                                    New Reader
                                </Button>
                            </>
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
            onRowSelectionModelChange={(e) => {
                if (props.onSelectionChange) {
                    props.onSelectionChange(e);
                }
                setSelectionModel(e);
            }}
            keepNonExistentRowsSelected
        />
    );
};

export default ReaderTable;
