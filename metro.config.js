// This file is required to fix a known compatibility issue between
// the Firebase JS SDK and Expo's Metro bundler ("Component auth has
// not been registered yet" error). Do not remove this.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = false;

module.exports = config;