import AbstractCrudApi from './AbstractCrudApi';
import axios from 'axios-base';

export default class UserProfileApi extends AbstractCrudApi {
    constructor() {
        super('/user_profile');
    }

    getByUserId = async (userId) => {
        return axios.get(`${this.base}/user/${userId}`);
    };

    getOwn = async () => {
        return axios.get(`${this.base}/own`);
    };

    updateOwn = async (record) => {
        return axios.put(`${this.base}/own`, record);
    };

    forgotPassword = async (email) => {
        return axios.post('/authenticate/request_reset', { email });
    };

    resetPassword = async (record, token) => {
        return axios.post('/authenticate/reset', record, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
    };
}
