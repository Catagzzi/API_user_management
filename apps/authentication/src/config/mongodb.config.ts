import * as MongoDbUri from 'mongodb-uri';

const mongoUriString = process.env.DBMONGO_URI || '';

const uriObject = MongoDbUri.parse(mongoUriString);

uriObject.database = process.env.DB_NAME || 'aladia-challenge';

export const mongoUri = MongoDbUri.format(uriObject);

console.log('MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
