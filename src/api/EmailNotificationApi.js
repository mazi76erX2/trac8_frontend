import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class EmailNotificationApi extends AbstractCrudApi {
    constructor() {
        super('/email_subscriber');
    }
}
