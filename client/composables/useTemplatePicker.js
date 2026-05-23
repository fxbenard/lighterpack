import backpackingData from '../data/templates/3-day-backpacking.json';
import ultralightData from '../data/templates/weekend-ultralight.json';
import carCampingData from '../data/templates/winter-car-camping.json';

export const templates = [
    {
        id: '3-day-backpacking',
        name: '3-Day Backpacking',
        description: '30 items across 6 categories — shelter, sleep, clothing, water, food, essentials',
        data: backpackingData,
    },
    {
        id: 'weekend-ultralight',
        name: 'Weekend Ultralight',
        description: '22 items, sub-10kg target — tarp, quilt, frameless pack',
        data: ultralightData,
    },
    {
        id: 'winter-car-camping',
        name: 'Winter Car Camping',
        description: '28 items for cold-weather car camping — 4-season tent, insulated sleep system',
        data: carCampingData,
    },
];
