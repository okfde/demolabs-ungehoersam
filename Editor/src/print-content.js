import {bindable} from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {PrintLocations} from "./messages";
import {Data} from './data';

/**
 * A single QR code with its accompanying text for printing.
 */
@inject(Data)
export class PrintContent {
    @bindable location = null;

    constructor(data) {
        this.data = data;
    }

    created() {
        this.gameInfo = this.data.getGameInfo();
    }

    locationChanged() {
        if (this.location) {
            this.qrCodeText = this.location.toQRCodeText(this.gameInfo);
        } else {
            this.qrCodeText = "";
        }
    }
}
