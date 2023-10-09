import AbstractCrudApi from './AbstractCrudApi';

export default class UserApi extends AbstractCrudApi {
    constructor() {
        super('/user');
    }
}
