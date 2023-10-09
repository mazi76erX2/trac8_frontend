import AbstractCrudApi from './AbstractCrudApi';
import axios from 'axios-base';

export default class StockTakeApi extends AbstractCrudApi {
    constructor() {
        super('/stock_take');
    }

    createRecursive = async (record) => {
        console.log('CreateItem=', record);
        return await axios.post(`${this.base}/create_recursive`, record);
    };

    readRecursive = async () => {
        return axios.get(`${this.base}/recursive`);
    };

    updateRecursive = async (record) => {
        return axios.put(`${this.base}/update_recursive`, record);
    };
}
