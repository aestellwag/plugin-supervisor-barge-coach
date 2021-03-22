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
  'marginRight': '6px',
}

class SupervisorBargeButton extends React.Component {
  state = {
    muted: false
  }
  
  // On click we will be pulling the conference SID and supervisorSID
  // to trigger Mute / Unmute respectively for that user
  // We've built in resiliency if the supervisor refreshes their browser
  // or clicks monitor/un-monitor multiple times, it still confirms that
  // we allow the correct user to barge-in on the call

  handleClick = () => {
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSid = conference && conference.conferenceSid;
    const { supervisorCallSid, muted } = this.state;
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
      console.log(`Supervisor SID = ${supervisorCallSid}`);
      ConferenceService.unmuteParticipant(conferenceSid, supervisorParticipant.key);
      this.setState({ muted: false });
    } else {
      ConferenceService.muteParticipant(conferenceSid, supervisorParticipant.key);
      console.log(`Supervisor SID = ${supervisorCallSid}`);
      this.setState({ muted: true });
    }
  }

  // Render the button - however, we need to enhance this to toggle the icon when mute is on/off
  // to make this easier to see when they are unmuted.  Thinking a border when it is on (maybe green?)
  // Look to enhance this once you have it working!
  render() {
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon="Supervisor"
          disabled={!isLiveCall}
          onClick={this.handleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Barge-in"
          style={buttonStyle}
        />
      </ButtonContainer>
    )
  }
}

const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;
  return {
    myWorkerSID
  };
};

export default connect(mapStateToProps)(withTheme(SupervisorBargeButton));
