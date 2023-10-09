import { useEffect, useState, useContext } from 'react';

import { Tooltip, Button } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import DoneIcon from '@mui/icons-material/Done';
import ClearIcon from '@mui/icons-material/Clear';

import { AlarmHistoryContext } from 'contexts/alarm/AlarmHistoryContext';
import { AlarmContext } from 'contexts/alarm/AlarmContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import AlarmHistoryApi from 'api/AlarmHistoryApi';
import ExportButton from 'components/ExportButton';
import { Typography } from '@mui/material';

const AlarmHistoryTable = (props) => {
    const { records, setRecords, count, setCount } = useContext(AlarmHistoryContext);
    const alarmContext = useContext(AlarmContext);
    const alarmRecords = alarmContext.records;
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const [isLoading, setIsLoading] = useState(props.loading);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'timestamp', sort: 'desc' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const alarmHistoryApi = new AlarmHistoryApi();

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

            const countResult = await alarmHistoryApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await alarmHistoryApi.get({
                sortField: sort.field,
                sortMethod: sort.sort,
                pageSize,
                page: page + 1,
                searchQuery
            });

            result.data = result.data.map((e) => {
                e.comment =
                    e.comment == 'Alarm triggerd'
                        ? e.comment
                        : e.comment == null || e.comment == ''
                        ? 'Alarm disabled'
                        : 'Alarm disabled: ' + e.comment;
                return e;
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
        {
            field: 'read_event',
            headerName: 'TagID',
            flex: 1,
            renderCell: (params) => {
                const item = alarmRecords.find((r) => r.id == params.value);
                return <div>{item ? item['tag_id'] : null}</div>;
            }
        },
        {
            field: 'read_event_2',
            headerName: 'Description',
            flex: 1,
            renderCell: (params) => {
                const item = alarmRecords.find((r) => r.id == params.row.read_event);
                return <div>{item ? item['description'] : null}</div>;
            }
        },
        { field: 'comment', headerName: 'Comment', flex: 2 },
        { field: 'timestamp', headerName: 'Time', flex: 1 },
        {
            field: 'item_recovered',
            headerName: 'Item Recovered',
            renderCell: (params) => {
                if (params.value) {
                    return <DoneIcon style={{ color: 'green' }} />;
                } else {
                    return <ClearIcon color="error" />;
                }
            }
        }
    ];

    return (
        <div>
            <Typography sx={{ paddingTop: 5 }} variant="h4" gutterBottom>
                Alarm History
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
                                <ExportButton recordApi={alarmHistoryApi} />
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
        </div>
    );
};

export default AlarmHistoryTable;
