// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  oktaEnv: {
    issuer: 'https://dev-574317.oktapreview.com/oauth2/default',
    redirectUri: 'http://localhost:4200/implicit/callback',
    clientId: '0oac4ti0y8d6Cjh6v0h7'
  },
  serverPrefix: 'http://localhost/TCStatsServer2/public/api/v1'

};
