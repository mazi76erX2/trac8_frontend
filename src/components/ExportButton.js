import Papa from 'papaparse';
import { PropTypes } from 'prop-types';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ExportButton = (props) => {
    const handleExport = async () => {
        let records = await props.recordApi.all({});
        const csv = Papa.unparse(records.data);
        downloadCSV(csv);
    };

    const downloadCSV = (csv) => {
        var blob = new Blob([csv]);
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob, { type: 'text/plain' });
        a.download = 'data.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <>
            <Button disabled={props.disabled} variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}>
                Export
            </Button>
        </>
    );
};

ExportButton.propTypes = {
    field: PropTypes.string,
    label: PropTypes.string,
    touched: PropTypes.object,
    errors: PropTypes.object,
    children: PropTypes.node
};

export default ExportButton;
