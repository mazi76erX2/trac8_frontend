import { useEffect, useState, useContext } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';
import ExportButton from 'components/ExportButton';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { ItemCategoryContext } from 'contexts/item_category/ItemCategoryContext';
import { StockTakeContext } from 'contexts/stock_take/StockTakeContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import StockTakeApi from 'api/StockTakeApi';
import ItemCategoryApi from 'api/ItemCategoryApi';

const StockTakeTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(StockTakeContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);
    const itemCategoryContext = useContext(ItemCategoryContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'email', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [itemToDelete, setItemToDelete] = useState(null);
    const stockTakeApi = new StockTakeApi();
    const itemCategoryApi = new ItemCategoryApi();

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await stockTakeApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await stockTakeApi.readRecursive({
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

            const resultCategory = await itemCategoryApi.all({});

            itemCategoryContext.setRecords(
                resultCategory.data.map((x) => {
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
        setRecord({ ...record, stock_take_categories: record.stock_take_categories.map((r) => r.tag_category) });
    };

    const handleCloseDeletePopup = async () => {
        try {
            await stockTakeApi.delete(itemToDelete);
            fetchRecords();
            setSuccessMessage();
            setItemToDelete(null);
        } catch (error) {
            setErrorMessage('Could not delete stock take!');
        }
    };

    let columns = [
        { field: 'name', headerName: 'StockTake', flex: 1 },
        { field: 'description', headerName: 'Description', flex: 1 },
        { field: 'status', headerName: 'Status', flex: 1 },
        {
            field: 'stock_take_categories',
            headerName: 'Tag Categories',
            flex: 1,
            valueGetter: (params) => {
                const stockTakeCategories = params.row.stock_take_categories;
                const itemCategories = itemCategoryContext?.records.filter((r) =>
                    stockTakeCategories?.map((r) => r.tag_category).includes(r.id)
                );
                return itemCategories?.map((r) => r.name).join(', ');
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
                                    New StockTake
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

export default StockTakeTable;
