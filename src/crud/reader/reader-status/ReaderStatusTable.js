import { useEffect, useState, useContext } from 'react';

import { Tooltip } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import SignalWifiConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiConnectedNoInternet4';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';

import { ReaderStatusContext } from 'contexts/reader/ReaderStatusContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import ReaderApi from 'api/ReaderApi';
import { AuthContext } from 'hooks/auth-context';

const ReaderStatusTable = (props) => {
    const { records, setRecords, count, setCount } = useContext(ReaderStatusContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [connectingReaders, setConnectingReaders] = useState([]);
    const readerApi = new ReaderApi();
    const authContext = useContext(AuthContext);
    let isAdmin = authContext.authData.roles.indexOf('admin') > -1;
    let isSecurity = authContext.authData.roles.indexOf('security') > -1;
    let isCapture = authContext.authData.roles.indexOf('capture') > -1;

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

    let columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'location', headerName: 'Location', flex: 1 },
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
                    {isAdmin ? null : params.row.connected ? <SignalWifi4BarIcon /> : <SignalWifiConnectedNoInternet4Icon />}
                    {isAdmin && !params.row.connected && !connectingReaders.includes(params.row.id) && (
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
                    {isAdmin && params.row.connected && !connectingReaders.includes(params.row.id) && (
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
    );
};

export default ReaderStatusTable;
