import { Actions, Manager } from '@twilio/flex-ui';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';

const manager = Manager.getInstance();

// Listening for supervisor to monitor the call to enable the
// barge and coach buttons, as well as reset their muted/coaching states
Actions.addListener('afterMonitorCall', (payload) => {
    console.log('Located in the CustomerListeners.js file');
    console.log(`Monitor button triggered, enable the Coach and Barge-In Buttons`);
    manager.store.dispatch(BargeCoachStatusAction.setBargeCoachStatus({ 
        enableCoachButton: true,
        coaching: false,
        enableBargeinButton: true,
        muted: true 
    }));
});

// Listening for supervisor to click to unmonitor the call to disable the
// barge and coach buttons, as well as reset their muted/coaching states
Actions.addListener('afterStopMonitoringCall', (payload) => {
    console.log('Located in the CustomerListeners.js file');
    console.log(`Unmonitor button triggered, disable the Coach and Barge-In Buttons`);
    manager.store.dispatch(BargeCoachStatusAction.setBargeCoachStatus({ 
        enableCoachButton: false,
        coaching: false,
        enableBargeinButton: false,
        muted: true 
    }));
});