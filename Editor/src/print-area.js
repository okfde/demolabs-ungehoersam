import {Location} from "./location";
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {PrintLocations} from "./messages";

/**
 * The area where the content to be printed is hidden. Triggers a refresh and printing when it receives the
 * PrintLocations message.
 */
@inject(EventAggregator)
export class PrintArea {
    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    attached() {
        this.printLocationsSubscription = this.eventAggregator.subscribe(PrintLocations, e => this.printLocations(e.locations));
    }

    detached() {
        this.printLocationsSubscription.dispose();
        this.printLocationsSubscription = null;
    }

    printLocations(locations) {
        // Hack: Properly reset QR code display by waiting a frame before triggering the printing.
        this.locations = [];
        setTimeout(() => {
            this.locations = locations;
            setTimeout(() => { window.print(); }, 0);
        }, 0);
    }
}
