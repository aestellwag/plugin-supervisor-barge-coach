// Using the TokenValidator to authenticate so we can query the API
// We could do this directly from the plugin, but that requires us to provide
// the AccoundSID and AuthToken, which we do not want to have leak into the front end
// This the #1 why we are query this via a function vs directly in the plugin!

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


	// Passed in conference SID, Supervisor SID that is coaching, and coaching status
	const {
		syncDocName,
		conferenceSid,
		supervisorSid,
		coaching
	} = event;
	
	const client = context.getTwilioClient();

	// updating the Sync Doc
	const client = context.getTwilioClient();
	const syncService = client.sync.services(context.TWILIO_SYNC_SERVICE_SID);
	try {
		syncService.documents(syncDocName)
		.update({
			data: {
				conferenceSid: conferenceSid,
				supervisorSid: supervisorSid,
				coaching: coaching
			}
		})
	} catch (error){
			console.error(error);
			response.setBody({
				status: error.status || 500,
				error
			});
			response.setStatusCode(error.status || 500); 
	}
	console.log("forceUpdateSyncDoc request parameters:");
	console.log("syncDocName: ", event.syncDocName);
	console.log("conferenceSid:", event.conferenceSid);
	console.log("supervisorSid:", event.supervisorSid);
	console.log("coaching:", event.coaching);

	return callback(null, response);
});