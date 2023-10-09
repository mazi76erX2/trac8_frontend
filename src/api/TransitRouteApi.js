import AbstractCrudApi from './AbstractCrudApi';
import axios from 'axios-base';

export default class TransitRouteApi extends AbstractCrudApi {
    constructor() {
        super('/transit_route');
    }

    createRecursive = async (record) => {
        console.log('CreateItem=', record);
        return await axios.post(`${this.base}/create_recursive`, record);
    };

    readRecursive = async (record) => {
        return axios.get(`${this.base}/recursive`, record);
    };

    updateRecursive = async (record) => {
        return axios.put(`${this.base}/update_recursive`, record);
    };
}
