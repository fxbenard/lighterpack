const { withDb } = require('./_mongo');

withDb(async (db) => {
    console.log('loading users....');
    const users = await db.collection('users')
        .find({username: { '$regex' : '[A-Z]'} })
        .toArray();
    if (!users.length) {
        console.log('no users found');
        return;
    }
    console.log('searching for users...');

    for (const i in users) {
        var user = users[i];
        console.log(user.username);
        user.username = user.username.toLowerCase();
        await db.collection('users').replaceOne({ _id: user._id }, user);
    }
    console.log('complete');
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
