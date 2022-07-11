import { Socket } from 'socket.io';
import { z } from 'zod';

import { fAdminApp } from '../utils/gcloud/firebase'

const profilesCollection = fAdminApp.firestore().collection('profiles')


export const AuthenticateData = z.object({
	jwt: z.string(),
})
export type AuthenticateData = z.infer<typeof AuthenticateData>

/**
 * Zod schema validators to transform the `firebase/firestore` data.
 */
const ProfileData = z.object({
	uid: z.string(),
	username: z.string(),
	about: z.string(),
	pfp_url: z.string()
})
type ProfileData = z.infer<typeof ProfileData>

/**
 * Helper function to validate the User's credentials and assign their public credentials.
 * @param socket The Socket client of the User.
 * @param data The User's valid jwt.
 */
export async function onAuthenticate(socket: Socket, jwt: string) {
	try {
		const decodedJwt = await fAdminApp.auth().verifyIdToken(jwt)
	
		if (decodedJwt) {
			// Retrieve the User's profile information from `firebase/firestore`
			const documentData = await profilesCollection.doc(decodedJwt.uid).get()
			const userData = ProfileData.parse(documentData.data())
	
			// Assign user credentials.
			socket.data.jwt = decodedJwt
			socket.data.userData = {
				username: userData.username,
				pfp_url: userData.pfp_url,
				uid: userData.uid
			}
			socket.data.authenticated = true
			// console.log(`(User)${userData.username}: authenticated`)
			socket.emit('authenticated', true)
		}
	} catch (error) {
		console.log(`Client token expired: ${socket.id}`)
		socket.emit('authenticated', false)
	}
}