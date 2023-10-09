import { ItemCategoryContextProvider } from 'contexts/item_category/ItemCategoryContext';
import ItemCategoryTable from 'crud/item_category/ItemCategoryTable';
import ItemCategoryEditor from 'crud/item_category/ItemCategoryEditor';

// ==============================|| Readers ||============================== //

const TagsCategoryPage = () => {
    return (
        <ItemCategoryContextProvider>
            <ItemCategoryEditor />
            <ItemCategoryTable />
        </ItemCategoryContextProvider>
    );
};

export default TagsCategoryPage;
