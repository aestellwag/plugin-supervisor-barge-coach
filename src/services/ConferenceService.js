import { Manager } from '@twilio/flex-ui';
import { request } from './request';

class ConferenceService {

  manager = Manager.getInstance();

  // We are calling the mute-unmute-participant Twilio function
  // pasisng the conferenceSID, the participantSID, and 
  // Flip them from mute/unmute respectively when clicking the button
  _toggleParticipantMute = (conference, participantSid, muted) => {
    
    return new Promise((resolve, reject) => {
      request('mute-unmute-participant', this.manager, {
        conference,
        participant: participantSid,
        muted
      }).then(response => {
        console.log(`${muted ? 'Muting' : 'Unmuting'} successful for participant`, participantSid);
        resolve();
      }).catch(error => {
        console.error(`Error ${muted ? 'Muting' : 'Unmuting'} participant ${participantSid}\r\n`, error);
        reject(error);
      });
    });
  }

  // Calling to toggle mute status to true (mute)
  muteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, true);
  }

  // Calling to toggle mute status to false (unmute)
  unmuteParticipant = (conference, participantSid) => {
    return this._toggleParticipantMute(conference, participantSid, false);
  }
}

const conferenceService = new ConferenceService();

export default conferenceService;
