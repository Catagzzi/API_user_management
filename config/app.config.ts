export const appConfig = {
  gateway: {
    port: parseInt(process.env.GATEWAY_PORT, 10) || 3000,
  },

  authentication: {
    host: process.env.AUTH_SERVICE_HOST || 'localhost',
    port: parseInt(process.env.AUTH_SERVICE_PORT, 10) || 3001,
  },

  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || '',
  },
};
