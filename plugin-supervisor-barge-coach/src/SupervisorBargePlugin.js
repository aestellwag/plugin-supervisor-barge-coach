import { FlexPlugin } from 'flex-plugin';
import { VERSION } from '@twilio/flex-ui';
import React from 'react';

//import for the supervisor barge and coach buttons component
import SupervisorBargeCoachButton from './components/SupervisorBargeCoachButton';

//import the reducers
import reducers, { namespace } from './states';

const PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

//import the custom listeners
import './listeners/CustomListeners';

export default class SupervisorBargeCoachPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    //Registering the custom reducer/redux store
    this.registerReducers(manager);
    //Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="bargecoach-buttons" />);

  } //end init

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
     registerReducers(manager) {
      if (!manager.store.addReducer) {
        // eslint: disable-next-line
        console.error(`You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`);
        return;
      }
  
      manager.store.addReducer(namespace, reducers);
    }
} //end SupervisorBargeCoachPlugin
