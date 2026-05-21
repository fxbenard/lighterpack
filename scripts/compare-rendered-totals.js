const newDataTypes = require('../client/dataTypes.js');
const { withDb } = require('./_mongo');

const oldBaseUrl = 'http://dev.lighterpack.com:3001';
const newBaseUrl = 'http://dev.lighterpack.com:8080';

let workingListIds = [];
let originalIdsLength;

withDb(async (db) => {
    console.log('loading lists....');
    await getAllIds(db)
    .then(compareNextListRender)
    .then(() => {
        console.log('done.');
    })
    .catch((err) => {
        console.log('top level error.');
        console.log(err);
    });
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

function getAllIds(db) {
    return new Promise((resolve, reject) => {
        db.collection('users_prod').find({}).toArray()
            .then((users) => {
                if (!users.length) {
                    console.log('no users found');
                    return;
                }
                console.log(`found ${users.length} users`);


                users.forEach((user) => {
                    user.library.categories.forEach((category) => {
                        console.log(category.id);
                    });

                    const userListIds = user.library.lists.map(list => list.externalId).filter((listId) => {
                        if (!listId) {
                            return false;
                        }
                        return true;
                    });
                    workingListIds = workingListIds.concat(userListIds);
                });

                console.log('loading complete.');
                console.log(`found ${workingListIds.length} lists.`);

                originalIdsLength = workingListIds.length;

                resolve();
            })
            .catch(reject);
    });
}

function compareNextListRender() {
    if (!workingListIds.length) {
        return Promise.resolve();
    }

    const listId = workingListIds.pop();
    if (!(workingListIds.length % 50)) {
        console.log(`${Math.round(((originalIdsLength - workingListIds.length) / originalIdsLength) * 100)}%`);
    }
    return compareListRender(listId)
        .then(compareNextListRender);
}

function compareListRender(listId) {
    return new Promise((resolve, reject) => {
        const fullUrlOld = `${oldBaseUrl}/r/${listId}`;
        const fullUrlNew = `${newBaseUrl}/r/${listId}`;

        Promise.all([
            extractListTotal(fullUrlOld),
            extractListTotal(fullUrlNew),
        ])
            .then(([oldResponse, newResponse]) => {
                if (oldResponse !== newResponse) {
                    console.log('difference found!');
                    console.log(listId);
                    resolve();
                }
                resolve();
            });
    });
}

function extractListTotal(fullUrl) {
    return fetch(fullUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Unexpected status ${response.status}`);
            }
            return response.text();
        })
        .then((body) => {
            let totalRow = body.substr(body.indexOf('lpRow lpFooter lpTotal'));
            let totalCell = totalRow.substr(totalRow.indexOf('lpTotalValue'));
            let totalCellBody = totalCell.substr(totalCell.indexOf('>') + 1);
            totalCellBody = totalCellBody.substr(0, totalCellBody.indexOf('<'));
            return totalCellBody;
        });
}
