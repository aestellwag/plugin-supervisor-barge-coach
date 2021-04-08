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
    muted: true,
    enableBargeinButton: false
  }

  componentDidMount() {

    // Added a listening for when the supervisor hits the monitor call button
    // that it will enable the barge-in button, and on the reverse
    // once they unmonitor the call, it will disable the barge-in button
    // In both cases we set Mute to True to reset the muted stat
    Actions.addListener('afterMonitorCall', (payload) => {
      console.log(`Monitor button triggered, enable the Barge-in Button`);
      this.setState({ enableBargeinButton: true });
      this.setState({ muted: true });
      //this.state.enableBargeinButton = true;
      //this.state.muted = true;
    })
    Actions.addListener('afterStopMonitoringCall', (payload) => {
      console.log(`Unmonitor button triggered, disable the Barge-in Button`);
      this.setState({ enableBargeinButton: false });
      this.setState({ muted: true });
      //this.state.enableBargeinButton = false;
      //this.state.muted = true;
    })
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

  // Render the barge-in button, disable if the call isn't live or
  // if the supervisor isn't monitoring the call, toggle the icon based on muted status
  render() {
    const { muted, enableBargeinButton } = this.state;
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ muted ? `MuteLargeBold` : `MuteLarge`}
          disabled={!isLiveCall || !enableBargeinButton}
          onClick={this.handleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Barge-in"
          style={buttonStyle}
          color={ muted ? 'White' : `Red`}
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
