import {Data} from './data';
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {SaveStateChanged} from "./messages";
import {formatTwoDigits} from "./utility";

/**
 * A component showing the current save state of the Data class.
 */
@inject(Data, EventAggregator)
export class SaveStateDisplay {
    constructor(data, eventAggregator) {
        this.data = data;
        this.eventAggregator = eventAggregator;

        this.updateSaveState();
    }

    attached() {
        this.saveStateChangedSubscription = this.eventAggregator.subscribe(SaveStateChanged, this.updateSaveState.bind(this));
    }

    detached() {
        this.saveStateChangedSubscription.dispose();
        this.saveStateChangedSubscription = null;
    }

    updateSaveState() {
        if (this.data.lastSuccessfulSaveTime)
        {
            this.saveStateSuccessMessage =
                formatTwoDigits(this.data.lastSuccessfulSaveTime.getHours()) + ":"
                + formatTwoDigits(this.data.lastSuccessfulSaveTime.getMinutes()) + ":"
                + formatTwoDigits(this.data.lastSuccessfulSaveTime.getSeconds());
        }
        else
        {
            this.saveStateSuccessMessage = "Noch nicht gespeichert.";
        }

        if (this.data.lastSaveError)
        {
            this.saveStateFailureMessage = "Speicherfehler: " + this.data.lastSaveError;
        }
        else
        {
            this.saveStateFailureMessage = "";
        }
    }
}
