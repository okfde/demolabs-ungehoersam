/**
 * The game info data class, holding the name and starting location name.
 */
export class GameInfo {
    name = 'Spielname';
    startingLocation = 'Startort';

    constructor(name, startingLocation) {
        this.name = name;
        this.startingLocation = startingLocation;
    }

    clone() {
        return new GameInfo(this.name, this.startingLocation);
    }

    static revive(gameInfoData) {
        return $.extend(new GameInfo(), gameInfoData);
    }
}
