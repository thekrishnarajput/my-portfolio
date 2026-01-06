import moment from 'moment';
import morgan from 'morgan';
import { Request } from 'express';

function morganLogger() {
    morgan.token('date-list', () => {
        return moment().utcOffset(330).format('YYYY-MM-DD HH:mm:ss A');
    });

    // Custom IP token
    morgan.token('remote-ip', (req: Request) => {
        const ip =
            (req.headers['x-forwarded-for'] as string) ||
            req.ip ||
            req.socket.remoteAddress ||
            '';

        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            return '127.0.0.1';
        }

        // Handle IPv6 mapped IPv4 addresses
        return ip.replace('::ffff:', '');
    });

    const logFormat =
        'IP::remote-ip, Method::method, Route::url, Status-code::status, Request-time:[:date-list] Res::res[content-length] - Response-time::response-time ms';

    return morgan(logFormat);
}

export default morganLogger;

