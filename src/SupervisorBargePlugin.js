import { FlexPlugin } from 'flex-plugin';
import React from 'react';

//import for the supervisor barge button component
import SupervisorBargeButton from './components/SupervisorBargeButton';
//import for the supervisor coach button component
import SupervisorCoachButton from './components/SupervisorCoachButton';

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
    
    //Add the Barge Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeButton key="barge-button" />);
    
    //Add the Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorCoachButton key="coach-button" />);

  } //end init
} //end SupervisorBargePlugin
