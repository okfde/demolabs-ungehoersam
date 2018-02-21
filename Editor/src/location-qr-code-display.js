import {inject} from 'aurelia-framework';
import {activationStrategy} from 'aurelia-router';
import {Data} from './data';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LocationViewed} from './messages';
import {QrCodeService} from './qr-code-service';
import {formatTwoDigits} from './utility'

/**
 * Displays the QR code for a Location.
 */
@inject(Data, EventAggregator, QrCodeService)
export class LocationQrCodeDisplay {
    qrCodeText = '';

    constructor(data, eventAggregator, qrCodeService) {
        this.data = data;
        this.eventAggregator = eventAggregator;
        this.qrCodeService = qrCodeService;
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    activate(params, routeConfig) {
        this.routeConfig = routeConfig;
        this.location = this.data.getLocation(params.id);
        this.qrCodeText = this.location.toQRCodeText(this.data.getGameInfo());
        this.eventAggregator.publish(new LocationViewed(this.location));
    }
}
