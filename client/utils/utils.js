import assignIn from 'lodash/assignIn';
import eventBus from '../services/event-bus';

class lpError extends Error {
    constructor(response, statusCode = null) {
        super();

        this.message = 'An error occurred, please try again later.';
        this.statusCode = statusCode;
        this.errors = null;
        this.id = null;
        this.metadata = null;

        if (response.message) {
            this.message = response.message;
        } else if (response.errors && response.errors instanceof Array && response.errors.length && response.errors[0].message) {
            this.message = response.errors[0].message;
        }

        if (response.errors) {
            this.errors = response.errors;
        }
    }
}

export function fetchJson(url, options) {
    const fetchOptions = {
        method: 'GET',
        headers: {}
    };

    if (options) {
        assignIn(fetchOptions, options);
    }

    if (!fetchOptions.body && !fetchOptions.headers['Content-Type']) {
        fetchOptions.headers['Content-Type'] = 'application/json';
    }

    function parseJSON(response) {
        return new Promise((resolve, reject) => {
            response
                .text()
                .then((text) => {
                    let json;

                    try {
                        json = text ? JSON.parse(text) : {};
                    } catch (err) {
                        json = { message: response };
                    }

                    return resolve({
                        status: response.status,
                        ok: response.ok,
                        json,
                    });
                })
                .catch(err => reject(err));
        });
    }

    return new Promise((resolve, reject) => {
        fetch(url, fetchOptions)
            .then(parseJSON)
            .then((response) => {
                if (response.ok) {
                    return resolve(response.json);
                }
                if (response.status && (response.status === 401 || response.status === 403)) {
                    eventBus.emit('unauthorized');
                    return;
                }

                if (response.json) {
                    return reject(new lpError(response.json, response.status));
                }

                return reject(new lpError(response));
            })
            .catch((err) => {
                if (err && err instanceof TypeError && err.message === 'Failed to fetch') {
                    err = {};
                }

                return reject(new lpError(err));
            });
    });
}

export function getElementIndex(node) {
    let index = 0;
    while ((node = node.previousElementSibling)) {
        index++;
    }
    return index;
}

export function arrayMove(inputArray, oldIndex, newIndex) {
    const array = inputArray.slice();
    const element = array[oldIndex];
    array.splice(oldIndex, 1);
    array.splice(newIndex, 0, element);
    return array;
}
