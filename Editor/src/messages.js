/**
 * A message that is sent when a location is viewed.
 */
export class LocationViewed {
    constructor(location) {
        this.location = location;
    }
}

/**
 * A message that is sent when the save state changed.
 */
export class SaveStateChanged {
    constructor() {
    }
}

/**
 * A message that signals that a list of locations should be printed.
 */
export class PrintLocations {
    constructor(locations) {
        this.locations = locations;
    }
}

