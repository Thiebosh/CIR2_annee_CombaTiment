'use strict';
const path = require('path');

module.exports = {
    env: {
        // Webpack default's mode
        mode: 'development'
    },

    dev: {
        // show webpack performance hints ?
        // Must of them is just warnings about the bundle size
        hints: false,

        // use eslint loader ?
        // If true, webpack will lint the code during the bundling.
        // Linting errors and warnings we be shown in the console.
        useEslint: true,

        // Webpack devServer settings
        server: {
            // Server listening
            host: 'localhost',
            port: 3000,

            // watch for file update ?
            // If true, webpack will watch for file updates and
            // re-bundle and refresh the server
            watch: true
        }
    },

    build: {
        // Paths
        assetsRoot: path.resolve(__dirname, '../', 'dist'),
        assetsPublicPath: '/dist/',

        // Outputs
        outputBundle: 'bundle.js',
        outputVendor: 'vendor.js'
    }
};
