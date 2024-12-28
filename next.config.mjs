/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals = [...config.externals, { "socket.io-client": "io" }];
        return config;
    }
}

export default nextConfig;