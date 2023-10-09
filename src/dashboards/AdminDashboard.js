import { useEffect, useState, useContext } from 'react';

import { Grid, Typography, CircularProgress, Box } from '@mui/material';

import DashboardStat from 'components/cards/statistics/DashboardStat';

import DashboardApi from 'api/DashboardApi';
import { AdminDashboardContext } from 'contexts/admin/AdminDashboardContext';

import AuthContextProvider from 'hooks/auth-context';

const AdminDashboard = () => {
    const { stats, setStats } = useContext(AdminDashboardContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('AdminDashboard.useEffect(() => {');
        const api = new DashboardApi();

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await api.getAdminDashboard();
                console.log('AdminDashboard.useEffect, API Result=', result);
                setStats(result.data.stats);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return isLoading ? (
        <Box sx={{ display: 'flex' }}>
            <CircularProgress />
        </Box>
    ) : (
        <>
            <Grid container rowSpacing={2} columnSpacing={2} alignItems="center">
                {/* Stats */}
                <Grid item xs={0} md={3}></Grid>
                {stats?.map((stat) => (
                    <Grid item xs={12} md={2}>
                        <DashboardStat title={stat.title} count={stat.count} extra={stat.extra} />
                    </Grid>
                ))}
                <Grid item xs={0} md={3}></Grid>
                <Grid item xs={0} md={3}></Grid>
                <Grid item xs={0} md={3}></Grid>
            </Grid>
        </>
    );
};

export default AdminDashboard;
