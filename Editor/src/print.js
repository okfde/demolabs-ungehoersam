import {Data} from "./data";
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {PrintLocations} from "./messages";

/**
 * The printing overview. Triggers the printing via the PrintLocations message.
 */
@inject(Data, EventAggregator)
export class Print {
    constructor(data, eventAggregator) {
        this.data = data;
        this.eventAggregator = eventAggregator;
        this.locations = [];
    }

    created() {
        this.locations = this.data.getLocations();
    }

    print() {
        let printLocations = this.locations.filter(location => location.printChecked);
        printLocations = printLocations.sort((a, b) => (a.locationCodeUpperCase < b.locationCodeUpperCase) ? -1 : 1);
        this.eventAggregator.publish(new PrintLocations(printLocations));
    }

    selectionSetAll(value) {
        for (let location of this.locations) {
            location.printChecked = value;
        }
    }

    selectionInvert() {
        for (let location of this.locations) {
            location.printChecked = !location.printChecked;
        }
    }
}
