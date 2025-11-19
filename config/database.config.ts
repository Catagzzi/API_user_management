import * as MongoDbUri from 'mongodb-uri';

let cachedMongoUri: string | null = null;

export function getMongoUri(): string {
  if (cachedMongoUri) {
    return cachedMongoUri;
  }

  const mongoUriString = process.env.DBMONGO_URI || '';

  if (!mongoUriString) {
    throw new Error('DBMONGO_URI required but not defined');
  }

  const uriObject = MongoDbUri.parse(mongoUriString);
  uriObject.database = process.env.DB_NAME || 'aladia-challenge';

  cachedMongoUri = MongoDbUri.format(uriObject);

  console.log(
    'Mongo URI:',
    cachedMongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
  );

  return cachedMongoUri;
}
