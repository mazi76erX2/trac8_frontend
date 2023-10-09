import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';

import { LocationContext } from 'contexts/LocationContext';
import { TokenContext } from 'contexts/TokenContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import LocationApi from 'api/LocationApi';
import TokenApi from 'api/TokenApi';

const LocationTable = (props) => {
    const { records, setRecords, setRecord, count, setCount, addRecord } = useContext(LocationContext);
    const tokenContext = useContext(TokenContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState(props.selection ? props.selection : []);
    const [itemToDelete, setItemToDelete] = useState(null);
    const locationApi = new LocationApi();
    const tokenApi = new TokenApi();

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await locationApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await locationApi.get({
                sortField: sort.field,
                sortMethod: sort.sort,
                pageSize,
                page: page + 1,
                searchQuery,
                filterModel
            });

            setRecords(
                result.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );

            const allTokens = await tokenApi.all({});
            tokenContext.setRecords(
                allTokens.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );
        } catch (error) {
            setErrorMessage('Could not load locations! Check Location API');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            fetchRecords();
        } catch (error) {
            setErrorMessage('Could not load locations! Check Location API');
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
            await locationApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete location!');
        }
    };

    let columns = [
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'type', headerName: 'Type', flex: 1 },
        {
            field: 'token.token_id',
            headerName: 'Token',
            valueGetter: ({ row }) => {
                return tokenContext?.records.find((r) => r.id == row.token)?.active;
            },
            renderCell: ({ row }) => <>{tokenContext?.records.find((r) => r.id == row.token)?.active ? <CheckIcon /> : null}</>
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
                                    New Location
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

export default LocationTable;
