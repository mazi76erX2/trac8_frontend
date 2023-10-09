import { StockTakeContextProvider } from 'contexts/stock_take/StockTakeContext';
import { ItemCategoryContextProvider } from 'contexts/item_category/ItemCategoryContext';
import { StockTakeCategoryContextProvider } from 'contexts/stock_take_category/StockTakeCategoryContext';
import StockTakeTable from 'crud/stock_take/StockTakeTable';
import StockTakeEditor from 'crud/stock_take/StockTakeEditor';

// ==============================|| Stock Take ||============================== //

const StockTakePage = () => {
    return (
        <StockTakeContextProvider>
            <StockTakeCategoryContextProvider>
                <ItemCategoryContextProvider>
                    <StockTakeEditor />
                    <StockTakeTable />
                </ItemCategoryContextProvider>
            </StockTakeCategoryContextProvider>
        </StockTakeContextProvider>
    );
};

export default StockTakePage;
