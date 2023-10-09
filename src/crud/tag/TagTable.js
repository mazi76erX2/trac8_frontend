import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import ExportButton from 'components/ExportButton';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { TagContext } from 'contexts/tag/TagContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import TagApi from 'api/TagApi';
import user_status from 'enum/user_status';
import role from 'enum/role';

const TagTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(TagContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'email', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [uploading, setUploading] = useState(null);
    const tagApi = new TagApi();

    const uploadFile = async (selectedFile) => {
        setUploading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile, selectedFile.name);
            let response = await tagApi.upload(formData);
            setSuccessMessage(JSON.stringify(response.data));
        } catch (error) {
            console.log(JSON.stringify(error.response.data));
            setErrorMessage(JSON.stringify(error.response.data));
        } finally {
            setSortModel([{ field: 'lot_num', sort: 'ASC' }]);
            setUploading(false);
        }
    };

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await tagApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await tagApi.get({
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
        setRecord({});
    };

    const onEdit = async (record) => {
        setRecord(record);
    };

    const handleCloseDeletePopup = async () => {
        try {
            await tagApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete tag!');
        }
    };

    let columns = [
        { field: 'tag_id', headerName: 'Tag', flex: 1 },
        { field: 'item_description', headerName: 'Description', flex: 1 },
        { field: 'category', headerName: 'Category', flex: 1 }
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
                                itemToDelete ? itemToDelete['tag_id'] : null
                            }?`}</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    This action is not reversable, are you sure you want to delete{' '}
                                    {itemToDelete ? itemToDelete['tag_id'] : null}?
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
                                    New Tag
                                </Button>
                                <Button
                                    variant="contained"
                                    component={'label'}
                                    color="primary"
                                    sx={{ letterSpacing: '2px', float: 'right' }}
                                    loading={uploading}
                                >
                                    Upload Tags
                                    <input
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        type="file"
                                        onChange={(e) => uploadFile(e.target.files[0])}
                                        hidden={true}
                                    />
                                </Button>
                                <ExportButton recordApi={tagApi} />
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

export default TagTable;
