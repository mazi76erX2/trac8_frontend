import { useEffect, useState, useContext } from 'react';
import {
    Button,
    Card,
    CardContent,
    Typography,
    CardActions,
    IconButton,
    Collapse,
    TextField,
    Table,
    TableBody,
    TableRow,
    TableCell
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

import { SystemConfigContext } from 'contexts/SystemConfigContext';
import { SnackbarContext } from 'contexts/SnackbarContext';
import SystemConfigApi from 'api/SystemConfigApi';
import Trac8Config from 'enum/config/trac8_config';
import GlobalConfig from 'enum/config/global_config';

const SystemConfig = (props) => {
    const { records, setRecords, count, setCount } = useContext(SystemConfigContext);
    const { setErrorMessage, setSuccessMessage } = useContext(SnackbarContext);

    const [isLoading, setIsLoading] = useState(props.loading);
    const [expandedId, setExpandedId] = useState(null);

    const api = new SystemConfigApi();

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [filterModel, setFilterModel] = useState({ quickFilterValues: [] });
    const [sortModel, setSortModel] = useState([{ field: 'module', sort: 'desc' }]);

    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const { pageSize, page } = paginationModel;

            const { quickFilterValues } = filterModel;
            const sort = sortModel[0];
            const searchQuery = quickFilterValues.length < 1 ? null : quickFilterValues[0];

            const countResult = await api.count({
                searchQuery
            });
            setCount(parseInt(countResult.data));

            const result = await api.get({
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
        try {
            fetchRecords();
        } catch (error) {
            setErrorMessage('Could not load system config! Check SystemConfig API');
        }
    }, []);

    const handleExpandClick = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleInputChange = (event, record) => {
        const key = event.target.value;
        const updatedRecord = {
            ...record,
            data: {
                ...record.data,
                [event.target.name]: key
            }
        };
        const updatedRecords = records.map((r) => (r.id === record.id ? updatedRecord : r));
        setRecords([...updatedRecords]);
    };

    const handleSave = async (id) => {
        try {
            const recordToSave = records.find((r) => r.id == id);
            if (recordToSave) {
                delete recordToSave.key;
                await api.update(recordToSave);
                setSuccessMessage('Configuration updated successfully');
                fetchRecords();
            } else {
                setErrorMessage('No changes to save');
            }
        } catch (error) {
            setErrorMessage('Failed to update configuration');
        }
    };

    const getConfigOptions = (module) => {
        let options = [];
        switch (module) {
            case 'TRAC8':
                options = Object.values(Trac8Config.dictionary);
                break;
            case 'GLOBAL':
                options = Object.values(GlobalConfig.dictionary);
                break;
            default:
                break;
        }
        return options;
    };

    return (
        <div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                records.map((record) => (
                    <Card key={record.key} sx={{ marginBottom: '24px' }}>
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {record.module}
                                <IconButton
                                    onClick={() => handleExpandClick(record.key)}
                                    aria-expanded={expandedId === record.key}
                                    aria-label="show more"
                                >
                                    {expandedId === record.key ? <RemoveIcon /> : <AddIcon />}
                                </IconButton>
                            </Typography>
                        </CardContent>
                        <Collapse in={expandedId === record.key} timeout="auto" unmountOnExit>
                            <CardContent sx={{ padding: '0px 20px' }}>
                                <Table>
                                    <TableBody>
                                        {getConfigOptions(record.module).map((key) => (
                                            <TableRow key={key}>
                                                <TableCell>{key}</TableCell>
                                                <TableCell>
                                                    <TextField
                                                        name={key}
                                                        value={record.data[key] || ''}
                                                        variant="outlined"
                                                        onChange={(event) => handleInputChange(event, record)}
                                                        sx={{ display: 'block' }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardActions>
                                <Button size="small" color="primary" onClick={() => handleSave(record.key)}>
                                    Save
                                </Button>
                            </CardActions>
                        </Collapse>
                    </Card>
                ))
            )}
        </div>
    );
};

export default SystemConfig;
