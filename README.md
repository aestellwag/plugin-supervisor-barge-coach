# Twilio Flex Plugin - Supervisor Barge-In and Coach

Twilio Flex Plugins allow you to customize the appearance and behavior of [Twilio Flex](https://www.twilio.com/flex). If you want to learn more about the capabilities and how to use the API, check out our [Flex documentation](https://www.twilio.com/docs/flex).

## Pre-req

It is assumed you have the Flex Plugins CLI but if you do not please follow the below guide before moving to the Setup section:

[Flex CLI Plugin Install](https://www.twilio.com/docs/flex/developer/plugins/cli/install)

## Setup

Make sure you have [Node.js](https://nodejs.org) as well as [`npm`](https://npmjs.com) installed.

From the plugin directory
```
Run: 
npm install
```

```
Run: 
cd serverless
***rename the .env.example file to .env and change the below:
ACCOUNT_SID= Found at https://www.twilio.com/console
AUTH_TOKEN= Found at https://www.twilio.com/console 
```

```
Run: (from the serverless directory)
npm install
```

```
Run: 
twilio plugins:install &twilio-labs/plugin-serverless
```

```
Run: 
twilio serveless:deploy --assets
```
*Do this if you haven't deployed the serverless functions already*

```
Run: 
From the root plugin directory rename the .env.example file to .env and change the below:
REACT_APP_SERVICE_BASE_URL = 
Points to the Twilio Function Service URL (example: https://serverless-XXXX-dev.twil.io)

Can be found by by going to https://www.twilio.com/console/functions/overview/services then click on serverless (should look like serverless-XXXX-dev.twil.io)

REACT_APP_TASK-CHANNEL_SID =
Points to Voice Channel SID - Can be found by going to https://www.twilio.com/console/taskrouter/dashboard > click on Workspaces > then Task Channels
```

## Development

In order to develop locally, you can use the Webpack Dev Server by running (from the root plugin directory):

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
