import { useEffect, useState, useContext } from 'react';

import { Grid, Typography, CircularProgress, Box } from '@mui/material';

import DashboardStat from 'components/cards/statistics/DashboardStat';

import DashboardApi from 'api/DashboardApi';
import { SecurityDashboardContext } from 'contexts/security/SecurityDashboardContext';

import AuthContextProvider from 'hooks/auth-context';

const SecurityDashboard = () => {
    const { stats, setStats } = useContext(SecurityDashboardContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('SecurityDashboard.useEffect(() => {');
        const api = new DashboardApi();

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await api.getSecurityDashboard();
                console.log('SecurityDashboard.useEffect, API Result=', result);
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

export default SecurityDashboard;
