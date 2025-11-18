import 'dotenv/config'

import { Client } from 'whatsapp-web.js'

import { connectToDatabase } from './config/db'

await connectToDatabase()

const NODE_ENV = process.env.NODE_ENV || 'development'

const puppeteerConfig =
	NODE_ENV === 'production'
		? {
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			}
		: {}

export const client = new Client({
	puppeteer: puppeteerConfig,
})
