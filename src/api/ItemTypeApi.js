// import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class ItemTypeApi extends AbstractCrudApi {
    constructor() {
        super('/item_tag_type');
    }
}
