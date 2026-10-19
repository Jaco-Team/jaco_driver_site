import * as Sentry from '@sentry/nextjs';
import { errorMonitoringOptions, selfHostedDsn } from './shared/lib/monitoring/sentry';

// Next 16 executes this module before hydration; it does not call register().
const dsn = selfHostedDsn(process.env.NEXT_PUBLIC_SENTRY_DSN);
if (dsn) Sentry.init(errorMonitoringOptions(dsn));
