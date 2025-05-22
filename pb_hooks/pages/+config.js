module.exports = {
  plugins: [
    'pocketpages-plugin-auth',
    'pocketpages-plugin-js-sdk', // TODO: Need access to env() to set port here
    'pocketpages-plugin-ejs',
    'pocketpages-plugin-micro-dash',
  ],
  debug: true,
}
