import { z } from 'zod';

import { Server, Socket } from "socket.io"

import path from 'path'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'

// These have to run first and foremost to properly initialize the `env` vaiables.
const env = dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`) })
dotenvExpand.expand(env)

import { initFirebase } from './utils/gcloud/firebase'
initFirebase()

import { initPubsub } from './utils/gcloud/pubsub'
initPubsub()

import { JoinChatData, onJoinChat } from "./socket/onJoinChat"
import { onSendMessage } from "./socket/onSendMessage"
import { AuthenticateData, onAuthenticate } from './socket/onAuthenticate';

const PORT = parseInt(process.env.PORT!) || 3100

const io = new Server({
	path: '/',
	serveClient: false,
	cors: {
		origin: '*',
		allowedHeaders: ['Access-Control-Allow-Origin'],
		methods: ['GET', 'POST'],
		credentials: false
	},
	transports: ['websocket'],
	allowEIO3: true
})

io.on('connection', function (socket: Socket, ...args) {
	// prevent joining the default room assigned to the user
	socket.leave(socket.id)

	/**
	 * Event handler to be called to authenticate the given User.
	 */
	socket.on('authenticate', async function (data) {
		try {
			const authenticateData = AuthenticateData.parse(data)
			await onAuthenticate(socket, authenticateData.jwt)
		} catch (error) {
			console.log(error)
		}
	})

	/**
	 * Event handler used for joining a Chat.
	 */
	socket.on('join-chat', async function (data) {
		try {
			const joinChatData = JoinChatData.parse(data)
			await onJoinChat(socket, joinChatData)
		} catch (error) {
			console.log(error)
		}
	})

	/**
	 * Event handler used to send a message to a Chat.
	 */
	socket.on('send-message', async function (data) {
		// Ensure the User is in a current room and has valid credentials.
		try {
			const message = z.string().parse(data)
			await onSendMessage(socket, message)
		} catch (error) {
			console.log(error)
		}
	})
})

console.log(`Chat Socket.IO: Server listening on port ${PORT}`)
//io.to(pubsubData.message.room_id).emit('client-message, pubsubData.message.content)
io.listen(PORT)

/**
 * Automatically shut down the server if we are running a build test fire after the server has instantiated.
 * TODO: Run some health checks on an endpoint to make sure ports are exposed properly?
 * TODO: Run unit tests on the functions in /router
 */
 io.on('listening', () => {
	if (process.env.NODE_ENV === "buildtest") {
		io.close(() => {
			console.log(`Process ran successfully`)
			process.exit(0);
		})
	}
})