module.exports = function(api) {
  return {
    plugins: [
      'pocketpages-plugin-auth',
      {
        name: 'pocketpages-plugin-js-sdk',
        debug: api.env('POCKETPAGESJSSDK_DEBUG') ? true : false,
      },
      'pocketpages-plugin-ejs',
      'pocketpages-plugin-micro-dash',
    ],
    debug: api.env('POCKETPAGES_DEBUG') ? true : false,
  };
}
