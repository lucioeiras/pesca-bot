import qrcode from 'qrcode-terminal'

import { client } from './index.js'

client.on('qr', (qr) => {
	qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
	console.log('🚀 Conectado ao ZAP!')
})

client.on('auth_failure', (msg) =>
	console.error('🔒 Autenticação falhou:', msg),
)

client.on('disconnected', (reason) => console.error('🔌 Desconectado:', reason))

client.initialize()
