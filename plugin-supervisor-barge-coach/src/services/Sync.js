import { Manager } from "@twilio/flex-ui";
import { SYNC_CLIENT } from "../SupervisorBargePlugin";
import { request } from './request';

class SyncDocClass {

	constructor() {
		// Don't believe I need this now that I'm passing it in  t
		// const manager = Manager.getInstance();
		// const myWorkerSID = manager.store.getState().flex?.worker?.worker?.sid;
		// this.syncDocName = `syncDoc.${myWorkerSID}`;
	}

	// Getting the Sync Document
	getSyncDoc(syncDocName) {
		return new Promise(function (resolve) {
			SYNC_CLIENT
				.document(syncDocName)
				.then(doc => {
					resolve(doc)
				})
		})
	}


	// This is where we update the Sync Document we pass in the syncDocName we are updating, the conferenceSID
	// we are monitoring/coaching, the supervisor's Full name, and toggle the coaching status true/false
	updateSyncDoc(syncDocName, conferenceSID, supervisorFN, coaching) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						'conference': conferenceSID,
						'supervisor': supervisorFN,
						'coachingstatus': coaching
					}
				});
				return new Promise(function (resolve) {
					SYNC_CLIENT
						.document(syncDocName)
						.then(doc => {
							resolve(doc)
						})
				})
			})
	}

	// This will be called when we are tearing down the call to clean up the Sync Doc
	clearSyncDoc(syncDocName) {
		SYNC_CLIENT
			.document(syncDocName)
			.then(doc => {
				doc.update({
					data: { 
						'conference': "",
						'supervisor': "",
						'coachingstatus': false
					}
				});
			})
	}
	// TODO: If we find we do not need this, we can remove the updateSyncDoc.js file under ..\serverless\functions
	// 		 before updating the github repo
	// TODO: This is calling a function and I do not believe we will require this at all based
	// 		 on my testing, keeping it in for now until final review
	// forceUpdateStatus(syncDocName, conferenceSid, supervisorSid, coaching) {

	// 	const manager = Manager.getInstance();
	// 	const token = manager.user.token;
		
	// 	return new Promise((resolve, reject) => {
	// 		request('updateSyncDoc', this.manager, {
	// 			syncDocName,
	// 			conferenceSid,
	// 			supervisorSid,
	// 			coaching
	// 		}).then(response => {
	// 		  	resolve();
	// 		}).catch(error => {
	// 		  	reject(error);
	// 		});
	// 	});
	// }
}

export const SyncDoc = new SyncDocClass();
