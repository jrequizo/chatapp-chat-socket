import deasync from "deasync";

import { PubSub } from '@google-cloud/pubsub'

const pubSubClient = new PubSub({projectId: process.env.PUBSUB_PROJECT_ID})

/**
 * 	Initialization of PubSub components (Topics, Subscriptions).
 * 	Assigns handlers when a Message is pushed to a Topic that this API is subscribed to.
 */
async function _initPubsub() {
	try {
		// const tProfileCreate = pubSubClient.topic('profile-create')
		// const tProfileCreateSubscription = tProfileCreate.subscription('profile-create-subscription')
	} catch (error) {
		// console.log(error)
	}
}

/**
 * 	Helper function to synchronously run initialization function.
 */
const initPubsub = deasync((_: any) => {
	_initPubsub().then(() => {
		// Release control back to main event loop
		_()
	})
})

export {
	/**
	 * 	Initialization of PubSub components (Topics, Subscriptions).
	 * 	Assigns handlers when a Message is pushed to a Topic that this API is subscribed to.
	 */
	initPubsub,
	pubSubClient
}