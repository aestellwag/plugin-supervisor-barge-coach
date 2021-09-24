import React from 'react';
import { withTheme } from '@twilio/flex-ui';
import styled from '@emotion/styled';

// Used for the custom redux state
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Actions as BargeCoachStatusAction, } from '../states/BargeCoachState';

// Import to get Sync Doc updates
import { SyncDoc } from '../services/Sync';

const Status = styled('div')`
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  align-items: center;
  text-align: center;
`;

class CoachingStatusPanel extends React.Component {

  // Use to validate if we have subscribed to sync updates or not
  #syncSubscribed = false;

  syncUpdates() {

    //FIXME: Remove - this is for testing only
    console.error(`Within Coaching Status Panel syncSubscribed = ${this.#syncSubscribed}`);

    if (this.#syncSubscribed != true) {
      
      const myWorkerSID = this.props.myWorkerSID;
      let supervisorArray = this.props.supervisorArray;   
      // Let's subscribe to the sync doc as an agent/work and check
      // if we are being coached, if we are, render that in the UI
      // otherwise leave it blank
      const mySyncDoc = `syncDoc.${myWorkerSID}`;
      SyncDoc.getSyncDoc(mySyncDoc)
      .then(doc => {
        // We are subscribing to Sync Doc updates here and logging anytime that happens
        doc.on("updated", updatedDoc => {
          if (doc.value.data.supervisors != null) {
            supervisorArray = [...doc.value.data.supervisors];
          } else {
            supervisorArray = [];
          }
  
          // Set Supervisor's name that is coaching into props
          this.props.setBargeCoachStatus({ 
            supervisorArray: supervisorArray
          });
        })
      });
      this.#syncSubscribed = true;
    }

    return;
  }
  render() {
    
    const { supervisorArray } = this.props;
    this.syncUpdates();

    // If the supervisor array has value in it, that means someone is coaching
    // We will map each of the supervisors that may be actively coaching
    // Otherwise we will not display anything if no one is actively coaching
    if (supervisorArray.length != 0) {
      return (
        <Status>
          <div>You are being Coached by: 
            <h1 style={{ "color": 'green' }}>
              <ol>
                {supervisorArray.map(supervisorArray => (
                  <li key={supervisorArray.supervisor}>{supervisorArray.supervisor}</li>
                ))}
              </ol>
            </h1>
          </div>
        </Status>
      );
    } else {
      return (
        <Status>
        </Status>
      );
    }
  }
}

// Mapping the the logged in user sid so we can snag the Sync Doc
const mapStateToProps = (state) => {
  const myWorkerSID = state?.flex?.worker?.worker?.sid;

  // Also pulling back the states from the redux store as we will use those later
  // to manipulate the buttons
  const customReduxStore = state?.['barge-coach'].bargecoach;
  const supervisorArray = customReduxStore.supervisorArray;
  
  return {
    myWorkerSID,
    supervisorArray,
  };
};

// Mapping dispatch to props as I will leverage the setBargeCoachStatus
// to change the properties on the redux store, referenced above with this.props.setBargeCoachStatus
const mapDispatchToProps = (dispatch) => ({
  setBargeCoachStatus: bindActionCreators(BargeCoachStatusAction.setBargeCoachStatus, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(CoachingStatusPanel));