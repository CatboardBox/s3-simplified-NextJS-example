const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
    webpack: (config, options) => {
        if (config.resolve.plugins) {
            config.resolve.plugins.push(new TsconfigPathsWebpackPlugin());
        } else {
            config.resolve.plugins = [new TsconfigPathsWebpackPlugin()];
        }

        return config;
    },
};
