import {Location} from "./location";
import {Data} from "./data";
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

/**
 * A button used to add a location and immediately navigate to it.
 */
@inject(Data, Router)
export class AddLocationButton {
    constructor(data, router) {
        this.data = data;
        this.router = router;
    }

    addLocation() {
        let newLocation = this.data.createLocation();

        // First location? Set the location to the starting location.
        if (this.data.getLocationCount() === 1) {
            newLocation.locationName = this.data.getGameInfo().startingLocation;
        }

        this.router.navigateToRoute('location-editor', { id: newLocation.id });
    }
}
