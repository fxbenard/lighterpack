const { MongoClient } = require('mongodb');
const config = require('config');

const databaseUrl = config.get('databaseUrl');
const url = `mongodb://${databaseUrl}`;
const dbName = databaseUrl.split('/').pop();

async function withDb(run) {
    const client = new MongoClient(url);
    await client.connect();

    try {
        return await run(client.db(dbName));
    } finally {
        await client.close();
    }
}

module.exports = {
    withDb,
};
