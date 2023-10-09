// import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class ItemCategoryApi extends AbstractCrudApi {
    constructor() {
        super('/item_tag_category');
    }
}
