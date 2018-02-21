import {Location, NextLocation} from "./location";
import {GameInfo} from "./game-info";
import {areEqual, cloneData} from "./utility";
import * as localforage from "localforage";
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SaveStateChanged} from "./messages";

/**
 * The Data class encapsulates the game data and its locations and saves/loads them via localForage.
 */
@inject(EventAggregator)
export class Data {
    data = null;
    lastSaveData = null;
    lastSuccessfulSaveTime = null;
    lastSaveError = null;
    saveDataDelay = 5000;

    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    getNextLocationId() {
        let locationCount = this.data.locations.length;
        if (locationCount === 0) {
            return 0;
        } else {
            return this.data.locations[locationCount - 1].id + 1;
        }
    }

    loadData() {
        return new Promise(resolve => {
            localforage.getItem('data').then(data => {
                if (data) {
                    console.log("Data loaded!");

                    Data.reviveData(data);
                    this.data = data;
                } else {
                    console.log("No data saved yet. Using default data.")
                    this.data = this.getDefaultData();
                }
                this.lastSuccessfulSaveTime = new Date();
                this.lastSaveData = cloneData(this.data);
                this.queueSaveData();
                resolve();

            }).catch(err => {
                console.log("Couldn't load data: " + err);
                this.data = null;
            });
        });
    }

    getDefaultData() {
        return {
            locations: [ ],
            gameInfo: new GameInfo('Spielname', 'Startort')
        };
    }

    static reviveData(data) {
        for (let i = 0; i < data.locations.length; i++) {
            data.locations[i] = Location.revive(data.locations[i]);
        }

        data.gameInfo = GameInfo.revive(data.gameInfo);
    }

    saveData() {
        var saveData = cloneData(this.data);

        if (areEqual(saveData, this.lastSaveData)) {
            this.lastSuccessfulSaveTime = new Date();
            this.eventAggregator.publish(new SaveStateChanged());
            //console.log("Nothing changed.");
            this.queueSaveData();
            return;
        }

        localforage.setItem('data', saveData).then(() => {
            //console.log("Data saved!");
            this.lastSaveData = saveData;
            this.lastSuccessfulSaveTime = new Date();
            this.lastSaveError = null;
        }).catch(err => {
            console.log("Couldn't save data: " + err);
            this.lastSaveError = err;
        }).then(() => {
            this.eventAggregator.publish(new SaveStateChanged());
            this.queueSaveData();
        });
    }

    queueSaveData() {
        setTimeout(this.saveData.bind(this), this.saveDataDelay);
    }

    ensureDataIsLoaded() {
        if (!this.data) {
            console.log("Starting to load...")
            return this.loadData();
        }

        return new Promise(resolve => {
            resolve();
        });
    }

    getLocations() {
        return this.data.locations;
    }

    getLocation(id) {
        return this.data.locations.filter(x => x.id == id)[0];
    }

    getLocationCount() {
        return this.data.locations.length;
    }

    getTargetLocationFromNextLocation(location, nextLocation) {
        if (!nextLocation.locationName)
            return null;

        return this.getFirstLocationFilter(_location => (_location.locationName === nextLocation.locationName) && (_location !== location));
    }

    getFirstLocationFilter(filter) {
        let locations = this.data.locations.filter(filter);
        if (locations.length > 0)
            return locations[0];

        return null;
    }

    createLocation() {
        let newLocation = new Location(this.getNextLocationId());
        this.data.locations.push(newLocation);
        return newLocation;
    }

    getGameInfo() {
        return this.data.gameInfo;
    }

    deleteAll() {
        this.data = this.getDefaultData();
    }

    saveDataToJSON() {
        return JSON.stringify(this.data, null, 2);
    }

    getDataFromJSON(str) {
        let data = JSON.parse(str);
        if (!data.locations || !data.gameInfo)
            throw new Error("Wrong JSON Format");

        Data.reviveData(data);
        return data;
    }
}
