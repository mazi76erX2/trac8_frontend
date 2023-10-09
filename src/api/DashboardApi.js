import axios from 'axios-base';

export default class AdminDashboardApi {
    constructor() {
        this.base = 'dashboard';
    }

    getAdminDashboard = async () => axios.get(`${this.base}/admin`);

    getSecurityDashboard = async () => axios.get(`${this.base}/security`);

    getCaptureDashboard = async () => axios.get(`${this.base}/capture`);
}
