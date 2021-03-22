// Using the TokenValidator to authenticate so we can query the API
// We could do this directly from the plugin, but that requires us to provide
// the AccoundSID and AuthToken, which we do not want to have leak into the front end
// This is the #1 reason why we are query this via a function vs directly in the plugin!

const TokenValidator = require('twilio-flex-token-validator').functionValidator;

exports.handler = TokenValidator(async (context, event, callback) => {
  
  // '*' allows being called from any origin, this not the best security
  // practice and should only be used for testing; when builiding
  // a production plugin you should set the allowed origin to
  // 'https://flex.twilio.com' (or any custom domain serving the plugin)

  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Content-Type', 'application/json');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type'); 


  // Passed in conference SID, Participant SID we are changing, and if we are muting or unmuting
  const {
    conference,
    participant,
    muted
  } = event;
    
  console.log(`Updating participant ${participant} in conference ${conference}`);
  
  const client = context.getTwilioClient();

  // updating the muted status based on what is passed from the plugin
  let participantResponse;
  try {
    participantResponse = await client
      .conferences(conference)
      .participants(participant)
      .update({muted})
  } catch (error){
    console.error(error);
  }
  console.log('Participant response properties:');

  Object.keys(participantResponse).forEach(key => {
    console.log(`${key}: ${participantResponse[key]}`);
  });
  /* Need to confirm if this is still needed
  exports.response = (format, body) => {
    
    if(format === "json") {
         response.appendHeader('Content-Type', 'application/json');
         response.setBody(body);
    }
    
    return response;
    
  }
  */
  return callback(null, JSON.stringify(participantResponse));
});