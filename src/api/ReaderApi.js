import AbstractCrudApi from './AbstractCrudApi';
import axios from 'axios-base';
import _ from 'lodash';

export default class ReaderApi extends AbstractCrudApi {
    constructor() {
        super('/reader');
    }

    all = async (options = {}) => {
        let { sortField = 'name', sortMethod = 'DESC', searchQuery = null } = options;
        let endpoint = this.base;
        const response = await axios.get(endpoint);
        // Filtering
        if (searchQuery) {
            response.data = response.data.filter((item) => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()));
        }
        // Sorting
        response.data = _.orderBy(response.data, [sortField], [sortMethod.toLowerCase()]);
        return response;
    };

    get = async (options = {}) => {
        let { searchQuery = null, id = null } = options;
        if (id) {
            let endpoint = `${this.base}/${id}`;
            const response = await axios.get(endpoint);
            // Filtering
            if (searchQuery) {
                response.data = response.data.filter((item) => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()));
            }
            return response.data;
        }
        return this.all(options);
    };

    count = async ({ searchQuery }) => {
        const response = await this.all({ searchQuery });
        return { data: response.data.length.toString() };
    };

    create = async (record) => {
        console.log('CreateItem=', record);
        return await axios.post(this.base, record);
    };

    update = async (record) => {
        return await axios.post(this.base, record);
    };

    delete = async (record) => {
        return await axios.delete(`${this.base}/${record.id}`);
    };

    connect = async (record) => {
        return await axios.post(`${this.base}/connect/${record.id}`, null);
    };

    disconnect = async (record) => {
        return await axios.post(`${this.base}/disconnect/${record.id}`, null);
    };

    isConnected = async (record) => {
        try {
            let response = await axios.get(`/is-connected/${record.id}`, null);
            return response.data;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    disableAlarm = async (id) => {
        try {
            let response = await axios.post(`${this.base}/stop-alarm/${id}`, null);
            return response.data;
        } catch (error) {
            console.error(error);
            return false;
        }
    };
}
