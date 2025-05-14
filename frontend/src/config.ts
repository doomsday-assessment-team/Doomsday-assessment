declare global {
    interface Window {
        APP_CONFIG: Readonly<{
            apiBaseUrl: string;
            environment: string;
        }>;
    }
}
const config = window.APP_CONFIG;
if (!config || !config.apiBaseUrl) {
     throw new Error("Missing application configuration (window.APP_CONFIG).");
}
export default config;