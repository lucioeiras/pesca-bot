import * as mongo from 'mongodb'

export const collections: {
	users?: mongo.Collection
	fishes?: mongo.Collection
	rods?: mongo.Collection
	trash?: mongo.Collection
} = {}

export const connectToDatabase = async () => {
	const client: mongo.MongoClient = new mongo.MongoClient(
		process.env.DB_CONN_STRING || '',
	)

	await client.connect()

	const db: mongo.Db = client.db(process.env.DB_NAME)

	const usersCollection: mongo.Collection = db.collection('users')
	const fishesCollection: mongo.Collection = db.collection('fishes')
	const rodsCollection: mongo.Collection = db.collection('rods')
	const trashCollection: mongo.Collection = db.collection('trash')

	collections.users = usersCollection
	collections.fishes = fishesCollection
	collections.rods = rodsCollection
	collections.trash = trashCollection

	console.log(
		`Successfully connected to database: ${db.databaseName} and collection: ${usersCollection.collectionName}`,
	)
}
