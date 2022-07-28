import { Socket } from 'socket.io';
import { z } from 'zod';
// import crypto from 'crypto'

export const JoinChatData = z.object({
	chatId: z.string(),
	type: z.enum(["public", "private"]),
})
export type JoinChatData = z.infer<typeof JoinChatData>

/**
 * 
 * @param socket The Socket client of the User.
 * @param chatData {@link JoinChatData} of the room the User is entering.
 */
export async function onJoinChat(socket: Socket, chatData: JoinChatData) {
	if (socket.data.authenticated) {	
		// leave the previous room if the User is in it.
		if (socket.data.currentRoom) {
			socket.leave(socket.data.currentRoom)
		}
		
		// If it's a private room, calculate the room id.
		// if (data.type === "private") {
		// 	let uids = [decodedJwt.uid, data.chat_id].sort()
	
		// 	currentRoom = crypto.createHash('md5').update(uids.toString()).digest('hex')
		// }
	
		// assign the current room
		socket.data.currentRoom = chatData.chatId
	
		// join the chatroom provided in the request if chatroom is `public`
		// console.log(`(User)${socket.data.userData.username}: joined ${chatData.chatId}`)
		socket.join(chatData.chatId)
	}
}