const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const config = require('config');

const username = process.argv[2];
const outputPath = process.argv[3];

if (!username || !outputPath) {
    console.error('Usage: node scripts/export-user-library.js <username> <output-file>');
    process.exit(1);
}

const databaseUrl = config.get('databaseUrl');
const url = `mongodb://${databaseUrl}`;
const dbName = databaseUrl.split('/').pop();

async function main() {
    const client = new MongoClient(url);
    await client.connect();

    try {
        const db = client.db(dbName);
        const user = await db.collection('users').findOne({ username: username.toLowerCase().trim() });

        if (!user) {
            console.error(`No user found for username: ${username}`);
            process.exitCode = 2;
            return;
        }
        if (!user.library) {
            console.error(`User has no library: ${username}`);
            process.exitCode = 3;
            return;
        }

        const resolvedOutputPath = path.resolve(outputPath);
        fs.writeFileSync(resolvedOutputPath, `${JSON.stringify(user.library, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
        console.log(`Exported ${username} library to ${resolvedOutputPath}`);
    } finally {
        await client.close();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
