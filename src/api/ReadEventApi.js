import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class ReadEventApi extends AbstractCrudApi {
    constructor() {
        super('/read_event');
    }

    disableAlarmEvent = async (record, values) => {
        try {
            let response = await axios.put(`${this.base}/disable_event`, { record, values });
            return response.data;
        } catch (error) {
            console.error(error);
            return false;
        }
    };
}
