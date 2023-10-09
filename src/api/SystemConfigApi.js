import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class SystemConfigApi extends AbstractCrudApi {
    constructor() {
        super('/system_config');
    }
}
