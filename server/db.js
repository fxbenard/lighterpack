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

const ready = connect();

ready.catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
});

function normalizeId(value) {
    return typeof value === 'string' ? new ObjectId(value) : value;
}

function getCollection(name) {
    return ready.then(() => _db.collection(name));
}

function collection(name) {
    function deleteOne(filter) {
        return getCollection(name)
            .then((mongoCollection) => mongoCollection.deleteOne(filter._id ? { _id: normalizeId(filter._id) } : filter));
    }

    function deleteMany(filter) {
        return getCollection(name)
            .then((mongoCollection) => mongoCollection.deleteMany(filter));
    }

    return {
        find(query, callback) {
            if (!callback) {
                throw new TypeError('db.collection.find requires a callback. Use findMany for promise-based reads.');
            }

            return getCollection(name)
                .then((mongoCollection) => mongoCollection.find(query).toArray())
                .then((docs) => callback(null, docs))
                .catch((err) => callback(err, null));
        },
        findMany(query) {
            return getCollection(name)
                .then((mongoCollection) => mongoCollection.find(query).toArray());
        },
        findOne(query, callback) {
            const op = getCollection(name)
                .then((mongoCollection) => mongoCollection.findOne(query));

            if (!callback) {
                return op;
            }

            return op
                .then((doc) => callback(null, doc))
                .catch((err) => callback(err, null));
        },
        save(doc, callback) {
            const { _id, ...rest } = doc;
            const filter = _id ? { _id: normalizeId(_id) } : { _id: new ObjectId() };
            const update = { $set: rest };
            const options = { upsert: true, returnDocument: 'after' };

            const op = getCollection(name)
                .then((mongoCollection) => mongoCollection.findOneAndUpdate(filter, update, options))
                .then((result) => {
                    if (!doc._id && result && result._id) doc._id = result._id;
                    if (callback) callback(null, result);
                    return result;
                });

            if (!callback) {
                op.catch(() => {});
                return op;
            }

            return op.catch((err) => {
                callback(err);
                return null;
            });
        },
        deleteOne(filter) {
            return deleteOne(filter);
        },
        deleteMany(filter) {
            return deleteMany(filter);
        },
        remove(doc, justOne, callback) {
            const filter = doc._id ? { _id: normalizeId(doc._id) } : doc;
            const op = justOne ? deleteOne(filter) : deleteMany(filter);

            if (!callback) {
                op.catch(() => {});
                return op;
            }

            return op
                .then((result) => {
                    callback(null, result);
                    return result;
                })
                .catch((err) => {
                    callback(err);
                    return null;
                });
        },
    };
}

module.exports = {
    ready,
    users: collection('users'),
    libraries: collection('libraries'),
};
