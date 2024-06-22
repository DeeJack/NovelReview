import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, prettyPrint } = format;

export const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        format.json()
    ),
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new transports.File({ filename: '../log/error.log', level: 'error' }),
        new transports.File({ filename: '../log/info.log', level: 'info'}),
        new transports.File({ filename: '../log/warn.log', level: 'warn'}),
        new transports.File({ filename: '../log/combined.log' }),
        new transports.Console({ level: 'debug' })
    ],
});