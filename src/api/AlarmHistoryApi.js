import AbstractCrudApi from './AbstractCrudApi';

export default class AlarmHistoryApi extends AbstractCrudApi {
    constructor() {
        super('/alarm_history');
    }
}
