import { Configuration, FrontendApi } from '@ory/client';

export const kratos = new FrontendApi(
    new Configuration({
        basePath: 'http://localhost:4433', // Kratos Public API
        baseOptions: {
            withCredentials: true,
        },
    })
);

export const logoutUrl = 'http://localhost:4433/self-service/logout/browser';
