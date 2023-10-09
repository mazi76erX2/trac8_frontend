import { ItemContextProvider } from 'contexts/item/ItemContext';
import { LocationContextProvider } from 'contexts/LocationContext';
import { TokenContextProvider } from 'contexts/TokenContext';
import { ItemTypeContextProvider } from 'contexts/item_type/ItemTypeContext';
import { ItemCategoryContextProvider } from 'contexts/item_category/ItemCategoryContext';
import ItemTable from 'crud/item/ItemTable';

// ==============================|| Readers ||============================== //

const ItemsPage = () => {
    return (
        <ItemContextProvider>
            <LocationContextProvider>
                <TokenContextProvider>
                    <ItemTypeContextProvider>
                        <ItemCategoryContextProvider>
                            <ItemTable />
                        </ItemCategoryContextProvider>
                    </ItemTypeContextProvider>
                </TokenContextProvider>
            </LocationContextProvider>
        </ItemContextProvider>
    );
};

export default ItemsPage;
