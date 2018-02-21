import {Location} from "./location";
import {Data} from "./data";
import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LocationViewed} from "./messages";
import {Router} from 'aurelia-router';

/**
 * A list of Locations.
 */
@inject(Data, EventAggregator, Router)
export class LocationList {
    constructor(data, eventAggregator, router) {
        this.data = data;
        this.router = router;
        this.eventAggregator = eventAggregator;

        this.selectedId = -1;

        this.locations = [];
    }

    created() {
        this.locations = this.data.getLocations();
    }

    attached() {
        this.locationViewedSubscription = this.eventAggregator.subscribe(LocationViewed, msg => this.selectLocation(msg.location));
    }

    detached() {
        this.locationViewedSubscription.dispose();
        this.locationViewedSubscription = null;
    }

    addLocation() {
        let newLocation = this.data.createLocation();

        // First location? Set the location to the starting location.
        console.log("test", this.data.getLocationCount());
        if (this.data.getLocationCount() === 1) {
            newLocation.locationName = this.data.getGameInfo().startingLocation;
        }

        this.selectLocation(newLocation);
        this.router.navigateToRoute('location-editor', { id: newLocation.id });
    }

    selectLocation(location) {
        this.selectedId = location
                            ? location.id
                            : -1;
        return true;
    }

    locationClicked(location)
    {
        if (this.ignoreOneClick) {
            this.ignoreOneClick = false;
            return;
        }

        if (this.selectedId == location.id)
        {
            this.router.navigateToRoute('overview');
            this.selectLocation(null);
        }
        else
        {
            this.router.navigateToRoute('location-editor', { id: location.id });
            this.selectLocation(location);
        }
    }

    isLocationComplete(location)
    {
        for (let nextLocation of location.nextLocations) {
            if (!nextLocation.locationName)
                return false;

            var nextLocationTarget = this.data.getTargetLocationFromNextLocation(location, nextLocation);
            if (!nextLocationTarget) {
                return false;
            }
        }
        return true;
    }
}
