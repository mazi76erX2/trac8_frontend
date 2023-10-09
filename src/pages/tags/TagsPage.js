import { TagContextProvider } from 'contexts/tag/TagContext';
import TagTable from 'crud/tag/TagTable';
import TagEditor from 'crud/tag/TagEditor';

// ==============================|| Readers ||============================== //

const TagsPage = () => {
    return (
        <TagContextProvider>
            <TagEditor />
            <TagTable />
        </TagContextProvider>
    );
};

export default TagsPage;
