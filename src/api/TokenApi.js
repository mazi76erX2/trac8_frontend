import AbstractCrudApi from './AbstractCrudApi';

export default class TokenApi extends AbstractCrudApi {
    constructor() {
        super('/token');
    }
}
