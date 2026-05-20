const request = require('request');

const newDataTypes = require('../client/dataTypes.js');
const { withDb } = require('./_mongo');

const NewLibrary = newDataTypes.Library;

let successfulUsersCount = 0;
let erroredUsersCount = 0;
const erroredUsers = [];

withDb(async (db) => {
    console.log('loading users....');
    const users = await db.collection('users_prod').find({}).toArray();
    if (!users.length) {
        console.log('no users found');
        return;
    }

    for (const i in users) {
        const user = users[i];
        console.log(user.username);
        const library = new NewLibrary();
        try {
            library.load(user.library);
            successfulUsersCount++;
        } catch (err) {
            console.log(`${user.username} - ${err}`);
            erroredUsers.push(user.username);
            erroredUsersCount++;
        }
        const listIds = user.library.lists.map(list => list.externalId);
    }
    console.log('complete');
    console.log('---');
    console.log(`successful users: ${successfulUsersCount}`);
    console.log(`errored users: ${erroredUsersCount}`);
    console.log('---');
    console.log(erroredUsers);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
