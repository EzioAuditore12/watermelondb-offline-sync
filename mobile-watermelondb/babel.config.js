module.exports = function (api) {
  api.cache(true);
  return {
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ["react-native-worklets-core/plugin"], 
    ],
    presets: [['babel-preset-expo']],
  };
};