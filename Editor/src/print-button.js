import {bindable, inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {PrintLocations} from "./messages";

/**
 * A button triggering the printing of the supplied location.
 */
@inject(EventAggregator)
export class PrintButton {
    @bindable label = "Drucken";
    @bindable location = null;

    constructor(eventAggregator) {
        this.eventAggregator = eventAggregator;
    }

    print() {
        this.eventAggregator.publish(new PrintLocations([this.location]));
    }
}
