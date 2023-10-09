import { EmailNotificationContextProvider } from 'contexts/EmailNotificationContext';

import EmailNotificationTable from 'crud/email_notification/EmailNotificationTable';
import EmailNotificationEditor from 'crud/email_notification/EmailNotificationEditor';

// ==============================|| Readers ||============================== //

const EmailNotificationPage = () => {
    return (
        <EmailNotificationContextProvider>
            <EmailNotificationTable />
            <EmailNotificationEditor />
        </EmailNotificationContextProvider>
    );
};

export default EmailNotificationPage;
