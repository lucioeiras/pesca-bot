import 'dotenv/config'

import { Client } from 'whatsapp-web.js'

import { connectToDatabase } from './config/db'

await connectToDatabase()

export const client = new Client({})
