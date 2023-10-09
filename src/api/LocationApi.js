import AbstractCrudApi from './AbstractCrudApi';

export default class LocationApi extends AbstractCrudApi {
    constructor() {
        super('/location');
    }
}
