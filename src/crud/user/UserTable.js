import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { UserAdminContext } from 'contexts/admin/UserAdminContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import UserProfileApi from 'api/UserProfileApi';
import user_status from 'enum/user_status';
import { AuthContext } from 'hooks/auth-context';
import role from 'enum/role';

const UserTable = (props) => {
    const { records, setRecords, setRecord, count, setCount, setOwnProfile } = useContext(UserAdminContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const authContext = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'email', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const profileApi = new UserProfileApi();
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

            const countResult = await profileApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await profileApi.get({
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
        fetchRecords();
    }, [sortModel, filterModel, paginationModel]);

    const onClickNew = async (e) => {
        e.preventDefault();
        setOwnProfile(false);
        setRecord({ id: null, linked_user: {} });
    };

    const onEdit = async (record) => {
        setOwnProfile(false);
        setRecord(record);
    };

    const handleCloseDeletePopup = async () => {
        try {
            await profileApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete user!');
        }
    };

    let columns = [
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'firstname', headerName: 'Firstname', flex: 1 },
        { field: 'surname', headerName: 'Surname', flex: 1 },
        {
            field: 'linked_user.roles',
            headerName: 'Roles',
            valueGetter: (e) => e.row.linked_user.roles.map((r) => role.dictionary[r]),
            flex: 1
        },
        {
            field: 'linked_user.user_status',
            headerName: 'Status',
            valueGetter: (e) => user_status.dictionary[e.row.linked_user.user_status],
            flex: 1
        }
    ];
    if (!props.readOnly && isAdmin) {
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
                        {props.readOnly || !isAdmin ? null : (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ letterSpacing: '2px', float: 'right' }}
                                    onClick={onClickNew}
                                >
                                    New User
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
            keepNonExistentRowsSelected
        />
    );
};

export default UserTable;
