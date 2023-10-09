import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { EmailNotificationContext } from 'contexts/EmailNotificationContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import EmailNotificationApi from 'api/EmailNotificationApi';

const EmailNotificationTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(EmailNotificationContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'email', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState(props.selection ? props.selection : []);
    const [itemToDelete, setItemToDelete] = useState(null);
    const readerApi = new EmailNotificationApi();

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

            setRecords(
                result.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );
        } catch (error) {
            setErrorMessage('Could not load readers! Check EmailNotification API');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        try {
            fetchRecords();
        } catch (error) {
            setErrorMessage('Could not load readers! Check EmailNotification API');
        }
    }, [sortModel, filterModel, paginationModel]);

    const onClickNew = async (e) => {
        e.preventDefault();
        setRecord({ id: null, type: 'LOSS_PREVENTION' });
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
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'type', headerName: 'Type', flex: 1 }
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
                                itemToDelete ? itemToDelete['email'] : null
                            }?`}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    This action is not reversable, are you sure you want to delete{' '}
                                    {itemToDelete ? itemToDelete['email'] : null}?
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
                                    New Email Notification
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

export default EmailNotificationTable;
