import * as React from 'react';
import { Manager, IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';
import ConferenceService from '../services/ConferenceService';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';

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
  // getting props
  constructor(props) {
    super(props);
  }
  
  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user - muted comes from the redux store
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct user to barge-in on the call
  bargeHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const muted = this.props.muted;
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

    // If the supervisorParticipant.key is null return, this would be rare and best practice to include this
    // before calling any function you do not want to send it null values unless your function is expecting that
    if (supervisorParticipant.key == null) {
      console.log('supervisorParticipant.key = null, returning');
      return;
    }
    // Barge-in will "unmute" their line if the are muted, else "mute" their line if they are unmuted
    if (muted) {
      ConferenceService.unmuteParticipant(conferenceSid, supervisorParticipant.key);
      this.props.setBargeCoachStatus({ muted: false });
    } else {
      ConferenceService.muteParticipant(conferenceSid, supervisorParticipant.key);
      this.props.setBargeCoachStatus({ muted: true });
    }
  }

  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct worker to coach on the call
  coachHandleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const coaching = this.props.coaching;
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
    let agentParticipant = conferenceChildren.find(p => p.value.participant_type === 'worker'
      && this.props.agentWorkerSID === p.value.worker_sid);
    
    // This if statement is here for a rare edge case, if the supervisor refreshes after clicking
    // the call to monitor, the stickyWorker attribute will be null, which is what we leverage to confirm
    // we are coaching the correct worker.  In this case there is no easy way to get the stickyWorker without
    // the supervisor clicking the call within the Team View to re-populate the attribute.  We will default
    // to the first worker we find to coach for this scenario
    if (agentParticipant == null) {
      agentParticipant = conferenceChildren.find(p => p.value.participant_type === 'worker');
    }
    console.log(`Current agentWorkerSID = ${this.props.agentWorkerSID}`);
    console.log(`Current agentSID = ${agentParticipant?.key}`);

    // If the agentParticipant.key or supervisorParticipant.key is null return, this would be rare and best practice to include this
    // before calling any function you do not want to send it null values unless your function is expecting that
    if (agentParticipant.key == null || supervisorParticipant.key == null) {
      console.log('agentParticipant.key or supervisorParticipant.key = null, returning');
      return;
    }
    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (coaching) {
      ConferenceService.disableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({ 
        coaching: false,
        muted: true 
      });
    } else {
      ConferenceService.enableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.props.setBargeCoachStatus({ 
        coaching: true,
        muted: false 
      });
    }
  }

  // Render the coach and barge-in buttons, disable if the call isn't live or
  // if the supervisor isn't monitoring the call, toggle the icon based on coach and barge-in status
  render() {
    const muted = this.props.muted;
    const enableBargeinButton = this.props.enableBargeinButton;
    const coaching = this.props.coaching;
    const enableCoachButton = this.props.enableCoachButton;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ muted && coaching 
            ? `MuteLargeBold` 
            : coaching 
              ? `MuteLarge` 
              : muted 
                ? 'IncomingCall' : 'IncomingCallBold' }
          disabled={!isLiveCall || !enableBargeinButton}
          onClick={this.bargeHandleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ coaching ? (muted ? "You are muted" : "You are unmuted") : "Barge-in" }
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
// Also pulling back the states from the redux store as we will use those later
// to manipulate the buttons
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the buttons
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const muted = customReduxStore.muted;
  const enableBargeinButton = customReduxStore.enableBargeinButton;
  const coaching = customReduxStore.coaching;
  const enableCoachButton = customReduxStore.enableCoachButton;
  return {
    myWorkerSID,
    agentWorkerSID,
    muted,
    enableBargeinButton,
    coaching,
    enableCoachButton
  };
};

// Mapping dispatch to props as I will leverage the setBargeCoachStatus
// to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorBargeCoachButton));
