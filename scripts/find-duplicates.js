const newDataTypes = require('../client/dataTypes.js');
const { withDb } = require('./_mongo');

const erroredUsers = [];

withDb(async (db) => {
    console.log('loading users....');
    const users = await db.collection('users_prod').find({}).toArray();
    if (!users.length) {
        console.log('no users found');
        return;
    }
    console.log('searching for duplicates...');

    for (const i in users) {
        var user = users[i];
        var foundIds = [];
        var userErrored = false;
        const library = new newDataTypes.Library();
        library.load(user.library);
        const serialized = library.save();

        serialized.items.forEach((item) => {
            if (foundIds.indexOf(item.id) > -1) {
                console.log(`Found duplicate Id for: ${user.username} (item) ${item.id}`);
                userErrored = true;
                return;
            }
            foundIds.push(item.id);
        });
        serialized.categories.forEach((category) => {
            if (foundIds.indexOf(category.id) > -1) {
                console.log(`Found duplicate Id for: ${user.username} (category)${category.id}`);
                userErrored = true;
                return;
            }
            foundIds.push(category.id);
        });

        serialized.lists.forEach((list) => {
            if (foundIds.indexOf(list.id) > -1) {
                console.log(`Found duplicate Id for: ${user.username} (list)${list.id}`);
                userErrored = true;
                return;
            }
            foundIds.push(list.id);
        });

        if (userErrored) {
            erroredUsers.push(user.username);
        }
    }
    console.log('complete');
    console.log('---');
    console.log(`total # of errored users: ${erroredUsers.length}`);
    console.log('---');
    console.log(erroredUsers);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
