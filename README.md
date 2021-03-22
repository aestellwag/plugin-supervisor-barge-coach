# Your custom Twilio Flex Plugin

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

## Pre-req

It is assumed you have the Flex Plugins CLI but if you do not please follow the below guide before moving to the Setup section:

[Flex CLI Plugin Install](https://www.twilio.com/docs/flex/developer/plugins/cli/install)

Configure your Workspace to prepare fo the voicemail/callback piece of this plugin - reference: https://www.twilio.com/docs/flex/solutions-library/queued-callback-and-voicemail - Specificially the "Conifgure your Flex Workspace"

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

From the plugin directory
```
Run: 
npm install
```
*You should now be in the plugins directory


```
Run: 
cd public/resources
***rename the .env.example file to .env and change the TWILIO_WORKSPACE_SID=Your Flex Task Assignment SID
```

```
Run: 
cd serverless
***rename the .env.example file to .env and change the below:
ACCOUNT_SID= Found at https://www.twilio.com/console
AUTH_TOKEN= Found at https://www.twilio.com/console
TWILIO_WORKFLOW_SID=    ??Is this needed, need to clean up
TWILIO_WORKSPACE_SID=   ??Is this needed, need to clean up
TWILIO_NUMBER=          ??Is this needed, need to clean up
```

```
Run: 
npm install
```

```
Run: 
twilio serveless:deploy --assets
```
*Do this if you haven't deployed the serverless functions already*


## Development

In order to develop locally, you can use the Webpack Dev Server by running:

```
Run: 
Twilio flex:plugins:start
```

This will automatically start up the Webpack Dev Server and open the browser for you. Your app will run on `http://localhost:3000`. If you want to change that you can do this by setting the `PORT` environment variable:

When you make changes to your code, the browser window will be automatically refreshed.

## Deploy

When you are ready to deploy your plugin, in your terminal run:
```
Run: 
twilio flex:plugins:deploy --major --changelog "Notes for this version" --description "Functionality of the plugin"
```
For more details on deploying your plugin, refer to the [deploying your plugin guide](https://www.twilio.com/docs/flex/plugins#deploying-your-plugin).

Note: Common packages like `React`, `ReactDOM`, `Redux` and `ReactRedux` are not bundled with the build because they are treated as external dependencies so the plugin will depend on Flex to provide them globally.
