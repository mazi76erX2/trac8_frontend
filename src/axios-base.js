import axios from 'axios';
import { getApiBaseUrl } from './shared/globals';
import { convertDateStringsToDayjs, convertDayjsToDateStrings } from 'utils/object-util';

const instance = axios.create({
    baseURL: getApiBaseUrl()
});

instance.interceptors.response.use((response) => {
    response.data = convertDateStringsToDayjs(response.data);
    return response;
});
instance.interceptors.request.use((config) => {
    if (config.data && typeof config.data === 'object') {
        convertDayjsToDateStrings(config.data);
    }
    return config;
});

export default instance;
