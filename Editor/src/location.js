import {replaceAll} from "./utility";
import {BuildVersionDisplay} from "./build-version-display";

/**
 * The location data class.
 */
export class Location {
    id = 0;
    locationCode = '';
    locationName = '';
    sceneName = '';
    description = '';
    nextLocations = [];
    printChecked = true;

    constructor(id, locationCode, locationName, sceneName, description, nextLocations) {
        this.id = id;
        this.locationCode = locationCode  ? locationCode : "";
        this.locationName = locationName ? locationName : "";
        this.sceneName = sceneName  ? sceneName : "";
        this.description = description ? description : "";
        this.nextLocations = nextLocations ? nextLocations : [];
    }

    toQRCodeText(gameInfo) {
        let separator = "~~~~\n";
        let separatorReplacement = "~~~\n";
        let result = "";
        result += replaceAll(this.sceneName.trim() + "\n", separator, separatorReplacement);
        result += separator;
        result += replaceAll(this.description.trim() + "\n", separator, separatorReplacement);
        result += separator;
        if (this.nextLocations.length > 0) {
            for (let nextLocation of this.nextLocations) {
                result += "- Wenn du [" + nextLocation.decision.trim() + "], dann gehe zu [" + nextLocation.locationName.trim() + "].\n";
            }
        } else {
            result += "\n";
        }
        result += separator;
        result += "Spiel: " + replaceAll(gameInfo.name.trim() + "\n", separator, separatorReplacement);
        result += "Format: 01";
        return result;
    }

    get locationCodeUpperCase() {
        return this.locationCode.toUpperCase();
    }

    static revive(locationData) {
        var revivedLocation = $.extend(new Location(), locationData);
        for (let j = 0; j < revivedLocation.nextLocations; j++) {
            revivedLocation.nextLocations[i] = $.extend(new NextLocation(), locationData.nextLocations[i]);
        }
        return revivedLocation;
    }
}

/**
 * A target location inside a Location class.
 */
export class NextLocation {
    decision = 'Entscheidung';
    locationName = 'Zielort';

    constructor(decision, locationName) {
        this.decision = decision ? decision : "";
        this.locationName = locationName ? locationName : "";
    }

    clone() {
        return new NextLocation(this.decision, this.locationName);
    }
}