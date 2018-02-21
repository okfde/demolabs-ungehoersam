import {bindable, inject} from 'aurelia-framework';
import {QrCodeService} from "./qr-code-service"

/**
 * A QR code display component, taking text and displaying the resulting QR code as image.
 */
@inject(QrCodeService)
export class QrCodeDisplay {
    @bindable text = "";

    constructor(qrCodeService) {
        this.qrCodeService = qrCodeService;
    }

    attached() {
        this.refreshQrCode();
    }

    textChanged(newValue, oldValue) {
        if (!this.display)
            return;

        this.refreshQrCode();
    }

    refreshQrCode() {
        try {
            if (this.text) {
                this.display.innerHTML = this.qrCodeService.createQRCodeImageTag(this.text);
            } else {
                this.display.innerHTML = "";
            }
        } catch (exception) {
            this.display.innerHTML = exception.toString();
        }
    }
}
