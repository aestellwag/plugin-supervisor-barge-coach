import * as React from 'react';
import { IconButton, TaskHelper, withTheme } from '@twilio/flex-ui';
import styled from 'react-emotion';

// Used for Sync Docs
import { SyncDoc } from '../services/Sync'

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';

const ButtonContainer = styled('div')`
  display: flex;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
  justify-content: center;
`;

const buttonStyleActive = {
  'marginLeft': '6px',
  'marginRight': '6px',
  'color': 'forestgreen',
}

const buttonStyle = {
  'marginLeft': '6px',
  'marginRight': '6px'
}

class SupervisorPrivateToggle extends React.Component {
  // getting props
  constructor(props) {
    super(props);
  }
  // Initial sync doc listener, will use this when calling the coachHandleClick
  // Pull values from props as we need to confirm we are updating the agent's sync doc
  // and adding the conference, supervisor, and coaching status
  initSyncDoc(agentWorkerSID, conferenceSID, supervisorFN, coaching) {
    const docToUpdate = `syncDoc.${agentWorkerSID}`;

    // Updating the sync doc for the agent, this will be triggered only from coachHandleClick
    console.log(`Updating Sync Doc: ${docToUpdate}, with conference: ${conferenceSID}, supervisor coaching: ${supervisorFN}, and coaching status to: ${coaching}`);
    SyncDoc.updateSyncDoc(docToUpdate, conferenceSID, supervisorFN, coaching);
  }
  // We will toggle the private mode on/off based on the button click and the state
  // of the coachingStatusPanel state along with udpating the Sync Doc appropriately
  togglePrivateMode = () => {
    const coachingStatusPanel = this.props.coachingStatusPanel;
    const coaching = this.props.coaching;
    const { task } = this.props;
    const conference = task && task.conference;
    const conferenceSID = conference && conference.conferenceSid;

    if (coachingStatusPanel) {
      this.props.setBargeCoachStatus({ 
        coachingStatusPanel: false, 
      });
      // Updating the Sync Doc based on coaching status to remove supervisor
      this.initSyncDoc(this.props.agentWorkerSID, conferenceSID, "", false);
    } else {
      this.props.setBargeCoachStatus({ 
        coachingStatusPanel: true, 
      });
      // Updating the Sync Doc based on coaching status only if coaching is true
      // The Agent will pull this back within their Sync Doc to update the UI
      if(coaching) {
        this.initSyncDoc(this.props.agentWorkerSID, conferenceSID, this.props.supervisorFN, true);
      }
    }
  }

  // Render the Supervisor Private Mode Button to toggle if the supervisor wishes to remaind private when
  // coaching the agent
  render() {
    const coachingStatusPanel = this.props.coachingStatusPanel;

    const isLiveCall = TaskHelper.isLiveCall(this.props.task);

    return (
      <ButtonContainer>
        <IconButton
          icon={ coachingStatusPanel ? 'EyeBold' : 'Eye' }
          disabled={!isLiveCall}
          onClick={this.togglePrivateMode}
          themeOverride={this.props.theme.CallCanvas.Button}
          title={ coachingStatusPanel ? "Enable Private Mode" : "Disable Private Mode" }
          style={ coachingStatusPanel ? buttonStyleActive : buttonStyle }
        />
        { coachingStatusPanel ? "Normal Mode" : "Private Mode" }
      </ButtonContainer>
    );
  }
}

// Mappging the agent's sid, supervisor full name, and coachingStatusPanel flag within the custom redux store/state
const mapStateToProps = (state) => {
  const agentWorkerSID = state?.flex?.supervisor?.stickyWorker?.worker?.sid;
  const supervisorFN = state?.flex?.worker?.attributes?.full_name;

  const customReduxStore = state?.['barge-coach'].bargecoach;
  const coaching = customReduxStore.coaching;
  const coachingStatusPanel = customReduxStore.coachingStatusPanel

  return {
    agentWorkerSID,
    supervisorFN,
    coaching,
    coachingStatusPanel
  };
};

// Mapping dispatch to props as I will leverage the setAgentAssistanceStatus
// to change the properties on the redux store, referenced above with this.props.setAgentAssistanceStatus
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(SupervisorPrivateToggle));