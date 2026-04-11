import axios from 'axios';

export const verifyRecaptcha = async (token: string | undefined): Promise<boolean> => {
    if (!token) {
        return false;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        console.warn('RECAPTCHA_SECRET_KEY is not defined in environment variables. Assuming valid for dev.');
        return true; // Optionally fallback to true if config is missing, but log a warning.
    }

    try {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const data = new URLSearchParams({
            secret: secretKey,
            response: token,
        });

        const response = await axios.post(url, data.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (!response.data.success || response.data.score < 0.5) {
            console.warn('reCAPTCHA validation failed or score too low:', response.data);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return false;
    }
};
