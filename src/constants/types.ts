export type RegisterResponse = {
    data?: {
        loginCredentials?: {
            accessToken?: string;
            refreshToken?: string;
            user?: {
                adminId: string;
                organizationId?: string;
                email: string;
                role?: string;
            };
        };
        organizationDetails?: { name?: string; email?: string };
    };
    success?: boolean;
    message?: string;
};