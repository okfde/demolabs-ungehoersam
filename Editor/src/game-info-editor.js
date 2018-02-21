import {GameInfo} from "./game-info";
import {Data} from './data';
import {inject} from 'aurelia-framework';

/**
 * An editor form for the GameInfo.
 */
@inject(Data)
export class GameInfoEditor {
    constructor(data) {
        this.data = data;
    }

    created(owningView, myView) {
        this.gameInfo = this.data.getGameInfo();
    }
}
