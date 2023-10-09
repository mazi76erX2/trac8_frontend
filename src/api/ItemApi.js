import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class ItemApi extends AbstractCrudApi {
    constructor() {
        super('/item');
    }

    upload = async (formData) => {
        return axios.post(`${this.base}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    };
}
