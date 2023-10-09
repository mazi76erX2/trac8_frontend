import axios from 'axios-base';

/**
 * AbstractCrudApi is a base class for making CRUD API requests.
 */
export default class AbstractCrudApi {
    /**
     * Constructor for the AbstractCrudApi class.
     * @param {string} base - The base URL for the API.
     */
    constructor(base) {
        this.base = base;
    }

    getNextId = async () => {
        return axios.get(`${this.base}/next_val`);
    };

    /**
     * Get method to fetch data from the API, supporting sorting, and searching.
     * @param {object} options - An object containing the following properties:
     * @param {string} options.sortField - The field to sort the results by.
     * @param {string} [options.sortMethod='DESC'] - The sort method, either 'ASC' or 'DESC'.
     * @param {string} options.searchQuery - The search query string.
     * @returns {Promise} A promise that resolves with the fetched data.
     */
    all = async ({ sortField = null, sortMethod = 'DESC', searchQuery = null, filterModel = null }) => {
        let endpoint = this.base;
        if (sortField) {
            endpoint += `?sort_column=${searchQuery}&sort_method=${sortMethod.toUpperCase()}`;
        } else {
            endpoint += `?sort_method=${sortMethod.toUpperCase()}`;
        }
        if (searchQuery) {
            endpoint += `&search_string=${searchQuery}`;
        }
        if (filterModel) {
            endpoint += `&filter_model=${encodeURI(JSON.stringify(filterModel))}`;
        }
        return axios.get(endpoint);
    };

    /**
     * Get method to fetch data from the API, supporting sorting, pagination, and searching.
     * @param {object} options - An object containing the following properties:
     * @param {string} options.sortField - The field to sort the results by.
     * @param {string} [options.sortMethod='DESC'] - The sort method, either 'ASC' or 'DESC'.
     * @param {number} [options.page=1] - The current page number for pagination.
     * @param {number} [options.pageSize=10] - The number of items per page.
     * @param {string} options.searchQuery - The search query string.
     * @param {string} [options.id=null] - A mechanism to fetch a single object by it's ID.
     * @returns {Promise} A promise that resolves with the fetched data.
     */
    get = async ({ sortField, sortMethod = 'DESC', page = 1, pageSize = 10, searchQuery, id = null, filterModel = null }) => {
        if (id) {
            return axios.get(`${this.base}?id=${id}`);
        }
        let endpoint = `${
            this.base
        }?sort_column=${sortField}&sort_method=${sortMethod.toUpperCase()}&number_per_page=${pageSize}&page_number=${page}`;
        if (searchQuery) {
            endpoint += `&search_string=${searchQuery}`;
        }
        if (filterModel) {
            endpoint += `&filter_model=${encodeURI(JSON.stringify(filterModel))}`;
        }
        return axios.get(endpoint);
    };

    /**
     * The count method retrieves the total number of records from the API.
     * @returns {Promise} A promise that resolves with the total count of records.
     */
    count = async ({ searchQuery, selectedIds, notSelectedIds, filterModel }) => {
        if (selectedIds && selectedIds.length == 0) {
            selectedIds = null;
        }
        if (notSelectedIds && notSelectedIds.length == 0) {
            notSelectedIds = null;
        }
        let endpoint = `${this.base}/count`;

        let params = [];

        if (searchQuery) {
            params.push(`search_string=${searchQuery}`);
        }

        if (selectedIds) {
            params.push(`selected_ids=${selectedIds}`);
        }

        if (notSelectedIds) {
            params.push(`not_selected_ids=${notSelectedIds}`);
        }
        if (filterModel) {
            params.push(`filter_model=${encodeURI(JSON.stringify(filterModel))}`);
        }

        if (params.length > 0) {
            endpoint += '?';
            endpoint += params.join('&');
        }
        return await axios.get(endpoint);
    };

    create = async (record) => {
        return await axios.post(`${this.base}/create`, record);
    };

    update = async (record) => {
        return axios.put(this.base, record);
    };

    bulk = async (records) => {
        return await axios.post(`${this.base}/bulk`, records);
    };

    delete = async (record) => {
        return await axios.delete(`${this.base}/remove/${record.id}`);
    };
}
