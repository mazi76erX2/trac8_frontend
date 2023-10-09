// import axios from 'axios-base';
import AbstractCrudApi from './AbstractCrudApi';

export default class StockTakeCategoryApi extends AbstractCrudApi {
    constructor() {
        super('/stock_take_category');
    }
}
