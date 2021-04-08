import * as React from 'react';
import { Actions, IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import ConferenceService from '../services/ConferenceService';
import { connect } from 'react-redux';

const ButtonContainer = styled('div')`
  display: flex;
  justify-content: center;
  margin-bottom: 6px;
`;

const buttonStyle = {
  width: '44px',
  height: '44px',
  'marginLeft': '6px',
  'marginRight': '6px'
}

class SupervisorBargeCoachButton extends React.Component {
  state = {
    coaching: false,
    enableCoachButton: false,
    muted: true,
    enableBargeinButton: false
  }

  componentDidMount() {
    // Added a listening for when the supervisor hits the monitor call button
    // that it will enable the coach and barge-in buttons, and on the reverse
    // once they unmonitor the call, it will disable the coach and barge-in buttons
    // In both cases we set coaching to false to reset the state
    Actions.addListener('afterMonitorCall', (payload) => {
      console.log(`Monitor button triggered, enable the Coach and Barge-In Buttons`);
      this.setState({ enableCoachButton: true });
      this.setState({ coaching: false });
      this.setState({ enableBargeinButton: true });
      this.setState({ muted: true });
    })
    Actions.addListener('afterStopMonitoringCall', (payload) => {
      console.log(`Unmonitor button triggered, disable the Coach and Barge-In Buttons`);
      this.setState({ enableCoachButton: false });
      this.setState({ coaching: false });
      this.setState({ enableBargeinButton: false });
      this.setState({ muted: true });
    })
  }

  // Added component will unmount to remove the listener
  // otherwise we'd get a setState error if starting a new session
  componentWillUnmount() {
    Actions.removeAllListeners('afterMonitorCall', (payload) => {
      console.log(`Removing Listening and Unmounting`);
    })
    Actions.removeAllListeners('afterStopMonitoringCall', (payload) => {
      console.log(`Removing Listening and Unmounting`);
    })
  }
  
  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct user to barge-in on the call
  bargeHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const { muted } = this.state;
    const conferenceChildren = conference?.source?.children || [];

    // Checking the conference within the task for a participant with the value "supervisor", 
    // is their status "joined", reason for this is every time you click monitor/unmonitor on a call
    // it creates an additional participant, the previous status will show as "left", we only want the active supervisor, 
    // and finally we want to ensure that the supervisor that is joined also matches their worker_sid 
    // which we pull from mapStateToProps at the bottom of this js file
    const supervisorParticipant = conferenceChildren.find(p => p.value.participant_type === 'supervisor' 
      && p.value.status === 'joined' 
      && this.props.myWorkerSID === p.value.worker_sid);
    console.log(`Current supervisorSID = ${supervisorParticipant.key}`);

    // Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
    if (muted) {
      ConferenceService.unmuteParticipant(conferenceSid, supervisorParticipant.key);
      this.setState({ muted: false });
    } else {
      ConferenceService.muteParticipant(conferenceSid, supervisorParticipant.key);
      this.setState({ muted: true });
    }
  }

  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct user to coach on the call
  coachHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const { coaching } = this.state;
    const conferenceChildren = conference?.source?.children || [];

    // Checking the conference within the task for a participant with the value "supervisor", 
    // is their status "joined", reason for this is every time you click monitor/unmonitor on a call
    // it creates an additional participant, the previous status will show as "left", we only want the active supervisor, 
    // and finally we want to ensure that the supervisor that is joined also matches their worker_sid 
    // which we pull from mapStateToProps at the bottom of this js file
    const supervisorParticipant = conferenceChildren.find(p => p.value.participant_type === 'supervisor' 
      && p.value.status === 'joined' 
      && this.props.myWorkerSID === p.value.worker_sid);
    console.log(`Current supervisorSID = ${supervisorParticipant.key}`);

    // Pulling the agentSID that we will be coaching on this conference
    // Ensuring they are a worker (IE agent) and it matches the agentWorkerSID we pulled from the props
    // at the bottom of this js file
    const agentParticipant = conferenceChildren.find(p => p.value.participant_type === 'worker'
      && this.props.agentWorkerSID === p.value.worker_sid);
    console.log(`Current agentWorkerSID = ${this.props.agentWorkerSID}`);
    console.log(`Current agentSID = ${agentParticipant.key}`);


    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (coaching) {
      ConferenceService.disableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.setState({ coaching: false });
      this.setState({ muted: true });
    } else {
      ConferenceService.enableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.setState({ coaching: true });
      this.setState({ muted: false });
    }
  }

  // Render the coach and barge-in buttons, disable if the call isn't live or
  // if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
  render() {
    const { muted, enableBargeinButton } = this.state;
    const { coaching, enableCoachButton } = this.state;
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ muted && coaching ? `MuteLargeBold` : coaching ? `MuteLarge` : muted ? 'IncomingCall' : 'IncomingCallBold' }
          disabled={!isLiveCall || !enableBargeinButton}
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ coaching ? muted ? "You are muted" : "You are unmuted" : "Barge-in" }
          style={buttonStyle}
        />
        <IconButton
          icon={ coaching ? `DefaultAvatarBold` : `DefaultAvatar` }
          disabled={!isLiveCall || !enableCoachButton}
          onClick={this.coachHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Coach"
          style={buttonStyle}
        />
      </ButtonContainer>
    );
  }
}

// Getting the Supervisor's workerSID so we can use it later
// Also getting the Agent's workerSID we are monitoring to ensure
// This is specific to coaching to ensure we are unmuting the correct worker
// If there are multiple agents on the call
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  return {
    myWorkerSID,
    agentWorkerSID
  };
};

export default connect(mapStateToProps)(withTheme(SupervisorBargeCoachButton));
