import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { TransitRouteContext } from 'contexts/TransitRouteContext';
import { LocationContext } from 'contexts/LocationContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import TransitRouteApi from 'api/TransitRouteApi';
import LocationApi from 'api/LocationApi';

const TransitRouteTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(TransitRouteContext);
    const locationContext = useContext(LocationContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState(props.selection ? props.selection : []);
    const [itemToDelete, setItemToDelete] = useState(null);
    const transitRouteApi = new TransitRouteApi();

    const locationApi = new LocationApi();

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await transitRouteApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await transitRouteApi.readRecursive({
                sortField: sort.field,
                sortMethod: sort.sort,
                pageSize,
                page: page + 1,
                searchQuery,
                filterModel
            });

            const locationResult = await locationApi.all({});

            locationContext.setRecords(
                locationResult.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );

            setRecords(
                result.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );
        } catch (error) {
            setErrorMessage('Could not load Transit Routes! Check Transit Route API');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            fetchRecords();
        } catch (error) {
            setErrorMessage('Could not load Transit Routes! Check Transit Route API');
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
            await transitRouteApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete Transit Route!');
        }
    };

    let columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'start_location',
            headerName: 'Start Location',
            flex: 1,
            renderCell: (params) => {
                const item = locationContext?.records.find((r) => r.id == params.value);
                return <div>{item ? item['name'] : null}</div>;
            }
        },
        {
            field: 'end_location',
            headerName: 'End Location',
            flex: 1,
            renderCell: (params) => {
                const item = locationContext?.records.find((r) => r.id == params.value);
                return <div>{item ? item['name'] : null}</div>;
            }
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
                                    New Transit Route
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

export default TransitRouteTable;
