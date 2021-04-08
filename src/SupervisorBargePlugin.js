import { FlexPlugin } from 'flex-plugin';
import React from 'react';

//import for the supervisor barge and coach buttons component
import SupervisorBargeCoachButton from './components/SupervisorBargeCoachButton';

const PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

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
    
    //Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="bargecoach-buttons" />);

  } //end init
} //end SupervisorBargePlugin
