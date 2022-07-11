import { Socket } from 'socket.io';

import { fAdminApp } from '../utils/gcloud/firebase'

const db = fAdminApp.database()

/**
 * Helper function to handle sending a new Message to the User's current Chat:room.
 * @param socket The Socket client of the User.
 * @param content The message.
 */
export async function onSendMessage(socket: Socket, content: string) {
	if (socket.data.authenticated && socket.data.currentRoom) {
		// Construct Message object.
		const message = {
			chatId: socket.data.currentRoom,
			content: content,
			timestamp: Date.now(),
			sender: socket.data.userData,
		}

		// Add Message to `firebase/database`
		await db.ref(socket.data.currentRoom).child('messages').push(message)

		// Notify other Users in the Chat:room of the new Message.
		socket.to(socket.data.currentRoom).emit('emit-message', message)

		// TODO: publish a PubSub event to notify the other Websocket server instances of a new message
	}
}