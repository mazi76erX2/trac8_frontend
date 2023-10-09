import { ItemTypeContextProvider } from 'contexts/item_type/ItemTypeContext';
import { ItemCategoryContextProvider } from 'contexts/item_category/ItemCategoryContext';
import ItemTypeTable from 'crud/item_type/ItemTypeTable';
import ItemTypeEditor from 'crud/item_type/ItemTypeEditor';

// ==============================|| Readers ||============================== //

const TagsTypePage = () => {
    return (
        <ItemTypeContextProvider>
            <ItemCategoryContextProvider>
                <ItemTypeEditor />
                <ItemTypeTable />
            </ItemCategoryContextProvider>
        </ItemTypeContextProvider>
    );
};

export default TagsTypePage;
