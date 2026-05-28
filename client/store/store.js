import { createStore } from 'vuex';
import debounce from 'lodash/debounce';
import { notifyGlobalAlert, notifyUnauthorized } from '../services/app-events';
import { clearCookie, getLocalLibrary, hasLocalLibrary, readCookie, setLocalLibrary } from '../services/browser-storage';
import { arrayMove, fetchJson } from '../utils/utils';

const weightUtils = require('../utils/weight.js');
const dataTypes = require('../dataTypes.js');

const Item = dataTypes.Item;
const Category = dataTypes.Category;
const List = dataTypes.List;
const Library = dataTypes.Library;

const saveInterval = 10000;

const createInitialState = () => ({
    library: false,
    isSaving: false,
    syncToken: false,
    saveType: null,
    lastSaveData: null,
    loggedIn: false,
    globalAlerts: [],
});

const store = createStore({
    state: createInitialState,
    getters: {
        activeList(state) {
            return state.library.getListById(state.library.defaultListId);
        },
    },
    mutations: {
        pushGlobalAlert(state, alert) {
            const message = alert && alert.message ? alert.message : alert;

            if (!message) {
                return;
            }

            state.globalAlerts.push({
                id: `${Date.now()}-${Math.random()}`,
                message,
            });
        },
        removeGlobalAlert(state, alertId) {
            state.globalAlerts = state.globalAlerts.filter((alert) => alert.id !== alertId);
        },
        setSaveType(state, saveType) {
            state.saveType = saveType;
        },
        setSyncToken(state, syncToken) {
            state.syncToken = syncToken;
        },
        setLastSaveData(state, lastSaveData) {
            state.lastSaveData = lastSaveData;
        },
        setIsSaving(state, isSaving) {
            state.isSaving = isSaving;
        },
        signout(state) {
            clearCookie('lp');
            state.library = false; // duplicate logic
            state.loggedIn = false; // duplicate logic
        },
        setLoggedIn(state, loggedIn) {
            state.loggedIn = loggedIn;
        },
        loadLibraryData(state, libraryData) {
            const library = new Library();
            try {
                libraryData = JSON.parse(libraryData);
                library.load(libraryData);
                state.library = library;
            } catch (err) {
                state.globalAlerts.push({
                    id: `${Date.now()}-${Math.random()}`,
                    message: 'An error occurred while loading your data.',
                });
            }
            state.lastSaveData = JSON.stringify(library.save());
        },
        clearLibraryData(state) {
            state.library = false;
        },
        toggleSidebar(state) {
            state.library.showSidebar = !state.library.showSidebar;
        },
        setDefaultList(state, list) {
            state.library.defaultListId = list.id;
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        setTotalUnit(state, unit) {
            state.library.totalUnit = unit;
        },
        setDefaultUnits(state, units) {
            if (units.itemUnit) {
                state.library.itemUnit = units.itemUnit;
            }
            if (units.totalUnit) {
                state.library.totalUnit = units.totalUnit;
            }
        },
        toggleOptionalField(state, optionalField) {
            state.library.optionalFields[optionalField] = !state.library.optionalFields[optionalField];
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        updateCurrencySymbol(state, currencySymbol) {
            state.library.currencySymbol = currencySymbol;
        },
        newItem(state, { category, _isNew, name }) {
            const item = state.library.newItem({ category, _isNew });
            if (name) item.name = name;
            if (category && category.name && !item.category) item.category = category.name;
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        newCategory(state, list) {
            const category = state.library.newCategory({ list, _isNew: true });
            const item = state.library.newItem({ category });
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        newList(state) {
            const list = state.library.newList();
            const category = state.library.newCategory({ list });
            const item = state.library.newItem({ category });
            list.calculateTotals();
            state.library.defaultListId = list.id;
        },
        removeItem(state, item) {
            state.library.removeItem(item.id);
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        removeCategory(state, category) {
            const removed = state.library.removeCategory(category.id);
            if (removed === false) {
                state.globalAlerts.push({
                    id: `${Date.now()}-${Math.random()}`,
                    message: "Can't remove the last category in a list!",
                });
            }
        },
        removeList(state, list) {
            state.library.removeList(list.id);
        },
        reorderList(state, args) {
            state.library.lists = arrayMove(state.library.lists, args.before, args.after);
        },
        reorderCategory(state, args) {
            const list = state.library.getListById(args.list.id);
            list.categoryIds = arrayMove(list.categoryIds, args.before, args.after);
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        reorderItem(state, args) {
            const item = state.library.getItemById(args.itemId);
            const dropCategory = state.library.getCategoryById(args.categoryId);
            const list = state.library.getListById(args.list.id);
            const originalCategory = state.library.findCategoryWithItemById(item.id, list.id);
            const oldCategoryItem = originalCategory.getCategoryItemById(item.id);
            const oldIndex = originalCategory.categoryItems.indexOf(oldCategoryItem);

            if (originalCategory === dropCategory) {
                dropCategory.categoryItems = arrayMove(dropCategory.categoryItems, oldIndex, args.dropIndex);
            } else {
                originalCategory.categoryItems.splice(oldIndex, 1);
                dropCategory.categoryItems.splice(args.dropIndex, 0, oldCategoryItem);
            }
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        addItemToCategory(state, args) {
            const item = state.library.getItemById(args.itemId);
            const dropCategory = state.library.getCategoryById(args.categoryId);

            if (item && dropCategory) {
                dropCategory.addItem({ itemId: item.id });
                const categoryItem = dropCategory.getCategoryItemById(item.id);
                const categoryItemIndex = dropCategory.categoryItems.indexOf(categoryItem);
                if (categoryItem && categoryItemIndex !== -1) {
                    dropCategory.categoryItems = arrayMove(dropCategory.categoryItems, categoryItemIndex, args.dropIndex);
                }
                state.library.getListById(state.library.defaultListId).calculateTotals();
            }
        },
        createCategoryAndAddItem(state, args) {
            const list = state.library.getListById(state.library.defaultListId);
            const item = state.library.getItemById(args.itemId);
            const name = String(args.name || '').trim();

            if (!list || !item || !name) {
                return;
            }

            const existingCategory = list.categoryIds
                .map((id) => state.library.getCategoryById(id))
                .find((category) => category && String(category.name || '').trim().toLowerCase() === name.toLowerCase());

            const category = existingCategory || state.library.newCategory({ list });
            category.name = existingCategory ? existingCategory.name : name;

            if (!category.getCategoryItemById(item.id)) {
                category.addItem({ itemId: item.id });
            }

            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        updateListName(state, updatedList) {
            const list = state.library.getListById(updatedList.id);
            list.name = updatedList.name;
        },
        updateListDescription(state, updatedList) {
            const list = state.library.getListById(updatedList.id);
            list.description = updatedList.description;
        },
        updatePublicProfile(state, profile) {
            state.library.publicProfile = {
                ...state.library.publicProfile,
                ...profile,
            };
        },
        updateListVisibility(state, args) {
            const list = state.library.getListById(args.listId);
            if (list) {
                list.visibility = args.visibility;
                list.allowSearchIndexing = args.allowSearchIndexing === true;
            }
        },
        updateItemCreatorLink(state, args) {
            const item = state.library.getItemById(args.itemId);
            if (item) {
                item.affiliateUrl = args.affiliateUrl || '';
                item.promoCode = args.promoCode || '';
                item.promoLabel = args.promoLabel || '';
                item.shop = args.shop || item.shop || '';
            }
        },
        updateCreatorSettings(state, creator) {
            state.library.creator = {
                ...state.library.creator,
                ...creator,
            };
        },
        setExternalId(state, args) {
            const list = state.library.getListById(args.list.id);
            list.externalId = args.externalId;
        },
        updateCategoryName(state, updatedCategory) {
            const category = state.library.getCategoryById(updatedCategory.id);
            category.name = updatedCategory.name;
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        updateCategoryColor(state, updatedCategory) {
            const category = state.library.getCategoryById(updatedCategory.id);
            category.color = updatedCategory.color;
        },
        updateItem(state, item) {
            state.library.updateItem(item);
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        updateItemLink(state, args) {
            const item = state.library.getItemById(args.item.id);
            item.url = args.url;
        },
        updateItemImageUrl(state, args) {
            const item = state.library.getItemById(args.item.id);
            item.imageUrl = args.imageUrl;
            state.library.optionalFields.images = true;
        },
        updateItemImage(state, args) {
            const item = state.library.getItemById(args.item.id);
            item.image = args.image;
            state.library.optionalFields.images = true;
        },
        updateItemUnit(state, unit) {
            const previousItemUnit = state.library.itemUnit;
            state.library.itemUnit = unit;
            if (state.library.totalUnit === previousItemUnit) {
                state.library.totalUnit = unit;
            }
        },
        removeItemImage(state, updateItem) {
            const item = state.library.getItemById(updateItem.id);
            item.image = '';
        },
        updateCategoryItem(state, args) {
            args.category.updateCategoryItem(args.categoryItem);
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        removeItemFromCategory(state, args) {
            args.category.removeItem(args.itemId);
            state.library.getListById(state.library.defaultListId).calculateTotals();
        },
        copyList(state, listId) {
            const copiedList = state.library.copyList(listId);
            state.library.defaultListId = copiedList.id;
        },
        importCSV(state, importData) {
            const list = state.library.newList({});
            let category;
            const newCategories = {};
            let item;
            let categoryItem;
            let hasPrice = false;
            let hasWorn = false;
            let hasConsumable = false;
            let mergedCount = 0;
            let newCount = 0;
            const importedUnits = {};
            const previousItemUnit = state.library.itemUnit;

            list.name = importData.name;

            importData.data.forEach((row) => {
                if (row.unit) {
                    importedUnits[row.unit] = (importedUnits[row.unit] || 0) + 1;
                }

                if (newCategories[row.category]) {
                    category = newCategories[row.category];
                } else {
                    category = state.library.newCategory({ list });
                    newCategories[row.category] = category;
                }
                category.name = row.category;

                const decision = row._match ? row._match.decision : 'new';

                if (decision === 'merge' && row._match.item) {
                    item = state.library.getItemById(row._match.item.id);
                    if (item) {
                        if (row.category && !item.category) item.category = row.category;
                        if (row.brand && !item.brand) item.brand = row.brand;
                        category.addItem({ itemId: item.id, _isNew: false, qty: parseFloat(row.qty) || 1 });
                        mergedCount++;
                    } else {
                        // Item was deleted — fall back to creating new
                        item = state.library.newItem({ category, _isNew: false });
                        item.name = row.name;
                        item.description = row.description;
                        item.url = row.url;
                        item.price = row.price;
                        if (row.category) item.category = row.category;
                        if (row.brand) item.brand = row.brand;
                        if (row.imageUrl) item.imageUrl = row.imageUrl;
                        item.weight = weightUtils.WeightToMg(parseFloat(row.weight), row.unit);
                        item.authorUnit = row.unit;
                        newCount++;
                    }
                } else {
                    item = state.library.newItem({ category, _isNew: false });
                    item.name = row.name;
                    item.description = row.description;
                    item.url = row.url;
                    item.price = row.price;
                    if (row.category) item.category = row.category;
                    if (row.brand) item.brand = row.brand;
                    if (row.imageUrl) item.imageUrl = row.imageUrl;
                    item.weight = weightUtils.WeightToMg(parseFloat(row.weight), row.unit);
                    item.authorUnit = row.unit;
                    newCount++;
                }

                categoryItem = category.getCategoryItemById(item.id);
                if (categoryItem) {
                    categoryItem.qty = parseFloat(row.qty) || 1;
                    categoryItem.worn = row.worn;
                    categoryItem.consumable = row.consumable;
                }

                if (item.price) hasPrice = true;
                if (categoryItem && categoryItem.worn) hasWorn = true;
                if (categoryItem && categoryItem.consumable) hasConsumable = true;
            });

            if (hasPrice) state.library.optionalFields.price = true;
            if (hasWorn) state.library.optionalFields.worn = true;
            if (hasConsumable) state.library.optionalFields.consumable = true;

            const importedUnit = Object.keys(importedUnits).sort((a, b) => importedUnits[b] - importedUnits[a])[0];
            if (importedUnit) {
                state.library.itemUnit = importedUnit;
                if (state.library.totalUnit === previousItemUnit) {
                    state.library.totalUnit = importedUnit;
                }
            }

            state.library.defaultListId = list.id;
            state.library.getListById(list.id).calculateTotals();

            if (mergedCount > 0) {
                state.globalAlerts.push({
                    id: `${Date.now()}-${Math.random()}`,
                    message: `Import complete: ${mergedCount} item${mergedCount > 1 ? 's' : ''} merged with existing gear, ${newCount} new item${newCount !== 1 ? 's' : ''} added.`,
                });
            }
        },
        save() {
            // no-op
        },
    },
    actions: {
        init(context) {
            if (readCookie('lp')) {
                return context.dispatch('loadRemote');
            } if (hasLocalLibrary()) {
                return context.dispatch('loadLocal');
            }
            return new Promise((resolve, reject) => {
                context.commit('setLoggedIn', false);
                context.commit('clearLibraryData');
                resolve();
            });
        },
        loadLocal(context) {
            const libraryData = getLocalLibrary();
            context.commit('loadLibraryData', libraryData);
            context.commit('setSaveType', 'local');
            context.commit('setLoggedIn', false);
        },
        loadRemote(context) {
            return fetchJson('/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            })
                .then((response) => {
                    context.commit('setSyncToken', response.syncToken);
                    context.commit('loadLibraryData', response.library);
                    context.commit('setSaveType', 'remote');
                    context.commit('setLoggedIn', response.username);
                })
                .catch((error) => {
                    if (error && error.statusCode === 401) {
                        notifyUnauthorized(error.message);
                        return Promise.resolve();
                    }

                    return Promise.reject(error && error.message
                        ? error.message
                        : 'An error occurred while fetching your data, please try again later.');
                });
        },
    },
    plugins: [
        function save(store) {
            store.subscribe(debounce((mutation, state) => {
                const ignore = [
                    'setIsSaving',
                    'setSaveType',
                    'setSyncToken',
                    'setLastSaveData',
                    'signout',
                    'setLoggedIn',
                    'loadLibraryData',
                    'clearLibraryData',
                ];
                if (!state.library || ignore.indexOf(mutation.type) > -1) {
                    return;
                }
                const saveData = JSON.stringify(state.library.save());

                if (saveData == state.lastSaveData) {
                    return;
                }

                const saveRemotely = function (saveData) {
                    if (state.isSaving) {
                        setTimeout(() => { store.commit('save', true); }, saveInterval + 1);
                        return;
                    }

                    if (!saveData) {
                        saveData = JSON.stringify(state.library.save());
                    }

                    store.commit('setIsSaving', true);
                    store.commit('setLastSaveData', saveData);

                    return fetchJson('/saveLibrary/', {
                        method: 'POST',
                        body: JSON.stringify({ syncToken: state.syncToken, username: state.loggedIn, data: saveData }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'same-origin',
                    })
                        .then((response) => {
                            store.commit('setSyncToken', response.syncToken);
                            store.commit('setIsSaving', false);
                        })
                        .catch((error) => {
                            store.commit('setIsSaving', false);
                            let errorMessage = 'An error occurred while attempting to save your data.';

                            if (error && error.message) {
                                errorMessage = error.message;
                            }

                            if (error && error.statusCode === 401) {
                                notifyUnauthorized(errorMessage);
                            } else {
                                notifyGlobalAlert({ message: errorMessage });
                            }
                        });
                };

                if (state.saveType === 'remote') {
                    saveRemotely(saveData);
                } else if (state.saveType === 'local') {
                    setLocalLibrary(saveData);
                }
            }, saveInterval, { maxWait: saveInterval * 3 }));
        },
    ],
});

export default store;
