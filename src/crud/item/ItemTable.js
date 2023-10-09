import { useEffect, useState, useContext } from 'react';

import { Button } from '@mui/material';

import { DataGrid, GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

import { ItemContext } from 'contexts/item/ItemContext';
import { LocationContext } from 'contexts/LocationContext';
import { TokenContext } from 'contexts/TokenContext';
import { ItemTypeContext } from 'contexts/item_type/ItemTypeContext';
import { ItemCategoryContext } from 'contexts/item_category/ItemCategoryContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import ItemApi from 'api/ItemApi';
import LocationApi from 'api/LocationApi';
import TokenApi from 'api/TokenApi';
import ItemTypeApi from 'api/ItemTypeApi';
import ItemCategoryApi from 'api/ItemCategoryApi';
import CheckIcon from '@mui/icons-material/Check';

const ItemTable = (props) => {
    const { records, setRecords, setRecord, count, setCount } = useContext(ItemContext);
    const locationContext = useContext(LocationContext);
    const tokenContext = useContext(TokenContext);
    const itemTypeContext = useContext(ItemTypeContext);
    const itemCategoryContext = useContext(ItemCategoryContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'email', sort: 'ASC' }]);
    const [selectionModel, setSelectionModel] = useState([]);
    const [uploading, setUploading] = useState(null);
    const itemApi = new ItemApi();
    const locationApi = new LocationApi();
    const tokenApi = new TokenApi();
    const itemTypeApi = new ItemTypeApi();
    const itemCategoryApi = new ItemCategoryApi();

    const uploadFile = async (selectedFile) => {
        setUploading(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile, selectedFile.name);
            let response = await itemApi.upload(formData);
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

            const countResult = await itemApi.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await itemApi.get({
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

            const allLocations = await locationApi.all({});
            locationContext.setRecords(
                allLocations.data.map((x) => {
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

            const allCategories = await itemCategoryApi.all({});
            itemCategoryContext.setRecords(
                allCategories.data.map((x) => {
                    x.key = x.id;
                    return x;
                })
            );

            const allItemTypes = await itemTypeApi.all({});
            itemTypeContext.setRecords(
                allItemTypes.data.map((x) => {
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

    let columns = [
        { field: 'description', headerName: 'Description', flex: 1 },
        {
            field: 'type.name',
            headerName: 'Type',
            flex: 1,
            valueGetter: ({ row }) => {
                return itemTypeContext?.records.find((r) => r.id == row.type)?.name;
            }
        },
        {
            headerName: 'Category',
            flex: 1,
            valueGetter: ({ row }) => {
                let categoryId = itemTypeContext?.records.find((r) => r.id == row.type)?.category;
                if (categoryId) {
                    return itemCategoryContext?.records.find((r) => r.id == categoryId).name;
                }
                return null;
            }
        },
        { field: 'status', headerName: 'Status', flex: 1 },
        {
            field: 'location.name',
            headerName: 'Location',
            flex: 1,
            valueGetter: ({ row }) => {
                return locationContext?.records.find((r) => r.id == row.location)?.name;
            }
        },
        { field: 'last_seen', headerName: 'Last Seen', flex: 1 },
        {
            field: 'token.token_id',
            headerName: 'Token',
            valueGetter: ({ row }) => {
                return tokenContext?.records.find((r) => r.id == row.token)?.active;
            },
            renderCell: ({ row }) => <>{tokenContext?.records.find((r) => r.id == row.token)?.active ? <CheckIcon /> : null}</>
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
                        {props.readOnly ? null : (
                            <>
                                <Button
                                    variant="contained"
                                    component={'label'}
                                    color="primary"
                                    sx={{ letterSpacing: '2px', float: 'right' }}
                                    loading={uploading}
                                >
                                    Upload Items
                                    <input
                                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                        type="file"
                                        onChange={(e) => uploadFile(e.target.files[0])}
                                        hidden={true}
                                    />
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

export default ItemTable;
