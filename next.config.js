/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React’s Strict Mode for highlighting potential issues
    reactStrictMode: true,

    // Disable automatic trailing slashes on routes
    trailingSlash: false,
    webpack(config) {
        config.experiments = {
            ...(config.experiments || {}),
            asyncWebAssembly: true,
        };
        return config;
    },
}

module.exports = nextConfig
