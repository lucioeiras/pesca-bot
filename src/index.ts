import 'dotenv/config'

import { Client, LocalAuth } from 'whatsapp-web.js'

import { connectToDatabase } from './config/db'

const NODE_ENV = process.env.NODE_ENV || 'development'

await connectToDatabase()

export const client = new Client({
	authStrategy: new LocalAuth(),
	puppeteer: { headless: NODE_ENV === 'development' ? false : true },
})
