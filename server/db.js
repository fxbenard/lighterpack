const { MongoClient, ObjectId } = require('mongodb');
const config = require('config');

const url = `mongodb://${config.get('databaseUrl')}`;
const dbName = config.get('databaseUrl').split('/').pop();

let _db = null;
const _client = new MongoClient(url);

async function connect() {
    await _client.connect();
    _db = _client.db(dbName);
}

connect().catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});

function collection(name) {
    return {
        find(query, callback) {
            _db.collection(name).find(query).toArray()
                .then((docs) => callback(null, docs))
                .catch((err) => callback(err, null));
        },
        findOne(query, callback) {
            _db.collection(name).findOne(query)
                .then((doc) => callback(null, doc))
                .catch((err) => callback(err, null));
        },
        save(doc, callback) {
            const { _id, ...rest } = doc;
            const filter = _id ? { _id: typeof _id === 'string' ? new ObjectId(_id) : _id } : { _id: new ObjectId() };
            const update = { $set: rest };
            const options = { upsert: true, returnDocument: 'after' };
            _db.collection(name).findOneAndUpdate(filter, update, options)
                .then((result) => {
                    if (!doc._id && result) doc._id = result._id;
                    if (callback) callback(null, result);
                })
                .catch((err) => { if (callback) callback(err); });
        },
        remove(doc, justOne, callback) {
            const filter = doc._id ? { _id: typeof doc._id === 'string' ? new ObjectId(doc._id) : doc._id } : doc;
            const op = justOne
                ? _db.collection(name).deleteOne(filter)
                : _db.collection(name).deleteMany(filter);
            op.then((r) => { if (callback) callback(null, r); })
                .catch((err) => { if (callback) callback(err); });
        },
    };
}

module.exports = {
    users: collection('users'),
    libraries: collection('libraries'),
};
