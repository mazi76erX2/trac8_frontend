import { useEffect, useState } from 'react';

// material-ui
import { Grid, Typography } from '@mui/material';

// project import
import DashboardStat from 'components/cards/statistics/DashboardStat';

// assets
import UserApi from 'api/UserApi';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const DashboardDefault = () => {
    const [value, setValue] = useState('today');
    const [slot, setSlot] = useState('week');

    const [isCountingUsers, setIsCountingUsers] = useState(true);
    const [userCount, setUserCount] = useState(0);

    const userApi = new UserApi();

    /*useEffect(() => {
        const loadData = async () => {
            try {
                setIsCountingUsers(true);
                const userCount = await userApi.count({});
                console.log('Dashboard.GetUserCount=', userCount);
                setUserCount(parseInt(userCount.data));
            } finally {
                setIsCountingUsers(false);
            }
        };
        loadData();
    }, [userApi]);*/

    return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
            {/* row 1 */}
            <Grid item xs={12} sx={{ mb: -2.25 }}>
                <Typography variant="h5">Stats</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <DashboardStat title="Users" count={userCount} />
            </Grid>
        </Grid>
    );
};

export default DashboardDefault;
