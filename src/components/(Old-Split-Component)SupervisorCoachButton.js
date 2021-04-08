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

class SupervisorCoachButton extends React.Component {
  state = {
    coaching: false,
    enableCoachButton: false
  }

  componentDidMount() {

    // Added a listening for when the supervisor hits the monitor call button
    // that it will enable the barge-in button, and on the reverse
    // once they unmonitor the call, it will disable the barge-in button
    // In both cases we set coaching to false to reset the state
    Actions.addListener('afterMonitorCall', (payload) => {
      console.log(`Monitor button triggered, enable the Coach Button`);
      this.setState({ enableCoachButton: true });
      this.setState({ coaching: false });
      //this.state.enableCoachButton = true;
    })
    Actions.addListener('afterStopMonitoringCall', (payload) => {
      console.log(`Unmonitor button triggered, disable the Coach Button`);
      this.setState({ enableCoachButton: false });
      this.setState({ coaching: false });
      //this.state.enableCoachButton = false; 
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
    const agentParticipant = conferenceChildren.find(p => p.value.participant_type === 'worker');
    console.log(`Current agentSID = ${agentParticipant.key}`);


    // Coaching will "enable" their line if they are disabled, else "disable" their line if they are enabled
    if (coaching) {
      ConferenceService.disableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.setState({ coaching: false });
    } else {
      ConferenceService.enableCoaching(conferenceSid, supervisorParticipant.key, agentParticipant.key);
      this.setState({ coaching: true });
    }
  }

  // Render the coaching button, disable if the call isn't live or
  // if the supervisor isn't monitoring the call, toggle the icon based on coaching status
  render() {
    const { coaching, enableCoachButton } = this.state;
    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ coaching ? `SupervisorBold` : `Supervisor`}
          disabled={!isLiveCall || !enableCoachButton}
          onClick={this.handleClick}
          themeOverride={this.props.theme.CallCanvas.Button}
          title="Coach"
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

export default connect(mapStateToProps)(withTheme(SupervisorCoachButton));
