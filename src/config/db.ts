import * as mongo from 'mongodb'

export const collections: { users?: mongo.Collection } = {}

export const connectToDatabase = async () => {
	const client: mongo.MongoClient = new mongo.MongoClient(
		process.env.DB_CONN_STRING || '',
	)

	await client.connect()

	const db: mongo.Db = client.db(process.env.DB_NAME)

	const usersCollection: mongo.Collection = db.collection(
		process.env.USERS_COLLECTION_NAME || '',
	)

	collections.users = usersCollection

	console.log(
		`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`,
	)
}
