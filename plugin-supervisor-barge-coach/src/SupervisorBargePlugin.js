import { FlexPlugin } from 'flex-plugin';
import { Manager, Actions, VERSION } from '@twilio/flex-ui';
import React from 'react';

// Leverage for the Sync Documents used for Coach Alerts across user sessions
import { SyncClient } from "twilio-sync";
// Used for Sync Docs
import { SyncDoc } from './services/Sync'

// import for the supervisor barge and coach buttons component, and Coaching Panel
import SupervisorBargeCoachButton from './components/SupervisorBargeCoachButton'; 
import CoachingStatusPanel from './components/CoachingStatusPanel';
import SupervisorPrivateToggle from './components/SupervisorPrivateModeButton';

// import the reducers
import reducers, { namespace } from './states';
import { Actions as BargeCoachStatusAction, } from './states/BargeCoachState';
// import the custom listeners
import './listeners/CustomListeners';

const PLUGIN_NAME = 'SupervisorBargeCoachPlugin';

// Generate token for the sync client
export const SYNC_CLIENT = new SyncClient(Manager.getInstance().user.token);

// Refresh sync client token
function tokenUpdateHandler() {

  console.log("OUTBOUND DIALPAD: Refreshing SYNC_CLIENT Token");

  const loginHandler = Manager.getInstance().store.getState().flex.session.loginHandler;

  const tokenInfo = loginHandler.getTokenInfo();
  const accessToken = tokenInfo.token;

  SYNC_CLIENT.updateToken(accessToken);
}
/*
FIXME:  Great updates today, we now have the Sync Doc as an array so multiple supervisors can coach at the same time and it will display properly for the agent.  
        We've also changed it to say "is coaching" or "is monitoring.  We could use this to enhance what the agent sees, however, I will keep it at coaching for now.
        Next thing to work on is enhancement two.  With the addition of "is coaching" and "is Monitoring" we should be able to have the supervisor subscribe to the Sync Doc
        If they click the task (before they monitor the call) have it subscribe to updates and display IF a supervisor is actively engaged (IE monitoring, coaching or barged)
        We should be able to steal the way we map this within the CoachingStatusPanel Render (line 59 in CoachingStatusPanel.js)

        I shifted the initSync to the Sync doc finally, which is good.  Now that I have an array, I need when they unmonitor to follow the same process when they click the uncoach button

TODO:
      
      1 - Test if multiple Supervisors begin to monitor/coach and agent, what happens
        - Need to convert the Supervisor to an array, possibly add the monitor/coach/barge as a status, something like Supervisor is Montoring, Supervisor is Coaching, Supervisor has Joined the call
      (COMPLETED)
        1a - Now that the above is working, we need to remove the specific supervisor from the array when they unmonitor the call
        (COMPLETED)
      2 - Enhancement is to add who is monitoring/coaching/barged to the Supervisor Monitor Canvas so when an additional Supervisor is looking to do this, they can see
          who might be doing it as well.  Display the Name of the Supervisor and what they are actively doing (Andrew Stellwag is Monitoring, Andrew Stellwag is Coaching, etc..)
      3 - It looks like the reducer has a bug; the default action-type handler is supposed to return the initialState but it returns the current state unchanged.
      4 - Noticed sluggishness might reboot computer and test again, could be a none-issue

*/



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

    // Registering the custom reducer/redux store
    this.registerReducers(manager);
    // Add the Barge-in and Coach Option
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorBargeCoachButton key="bargecoach-buttons" />);
    // Add the Supervisor Private Mode Toggle
    flex.Supervisor.TaskOverviewCanvas.Content.add(<SupervisorPrivateToggle key="supervisorprviate-button" />);
    
    // Adding Coaching Status Panel to notify the agent who is Coaching them
    flex.CallCanvas.Content.add(
      <CoachingStatusPanel key="coaching-status-panel"> </CoachingStatusPanel>, {
        sortOrder: -1
    });
    
    // Only used for the coach feature if some reason the browser refreshes after the agent is being monitored
    // we will lose the stickyWorker attribute that we use for agentWorkerSID (see \components\SupervisorBargeCoachButton.js for reference)
    // We need to invoke an action to trigger this again, so it populates the stickyWorker for us 
    const agentWorkerSID = manager.store.getState().flex?.supervisor?.stickyWorker?.worker?.sid;
    const teamViewPath = localStorage.getItem('teamViewPath');

    // Check that the stickyWorker is null and that we are attempting to restore the last worker they monitored
    if (agentWorkerSID == null && teamViewPath != null) {
      console.log(`${teamViewPath}`);

      // We are parsing the prop teamViewTaskPath into an array, split it between the '/',
      // then finding which object in the array starts with WR, which is the SID we need
      const arrayTeamView = teamViewPath.split('/');
      const teamViewTaskSID = arrayTeamView.filter(s => s.includes('WR'));
      console.log(`teamViewSID = ${teamViewTaskSID}`);

      // Invoke action to trigger the monitor button so we can populate the stickyWorker attribute
      console.log(`Triggering the invokeAction`);
      Actions.invokeAction("SelectTaskInSupervisor", { sid: teamViewTaskSID });

      // If agentSyncDoc exists, clear the Agent Sync Doc to account for the refresh
      const agentSyncDoc = localStorage.getItem('agentSyncDoc');
      if(agentSyncDoc != null) {
        SyncDoc.clearSyncDoc(agentSyncDoc);
      }
      // This is here if the Supervisor refreshes and has toggled alerts to false
      // By default alerts are enabled unless they toggle it off
      let privateToggle = localStorage.getItem('privateToggle');
      if (privateToggle === "false") {
        manager.store.dispatch(BargeCoachStatusAction.setBargeCoachStatus({ 
          coachingStatusPanel: false, 
        }));
      }
    }

    // Add listener to loginHandler to refresh token when it expires
    manager.store.getState().flex.session.loginHandler.on("tokenUpdated", tokenUpdateHandler);
  
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
