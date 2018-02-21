import {Location, NextLocation} from "./location";
import {areEqual} from './utility';
import {Data} from './data';
import {inject} from 'aurelia-framework';
import {activationStrategy} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import {ObserverLocator} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {LocationViewed} from "./messages";
import {BindingSignaler} from 'aurelia-templating-resources';
import {DialogService} from 'aurelia-dialog';
import {TaskQueue} from 'aurelia-framework';
import {openDefaultDeleteConfirmationDialog} from "./utility";
import "vendor/horsey-modified";

/**
 * A Location editor form.
 */
@inject(Data, EventAggregator, Router, BindingSignaler, DialogService, ObserverLocator, TaskQueue)
export class LocationEditor {
    constructor(data, eventAggregator, router, bindingSignaler, dialogService, observerLocator, taskQueue) {
        this.data = data;
        this.eventAggregator = eventAggregator;
        this.router = router;
        this.bindingSignaler = bindingSignaler;
        this.dialogService = dialogService;
        this.observerLocator = observerLocator;
        this.taskQueue = taskQueue;

        this.nextLocationTargets = [];
        this.qrCodeMaxLength = 1000;
        this.qrCodeMaxLengthWarning = 800;

        this.nextLocationTargetAutoCompleteList = [];
        this.nextLocationTargetAutoCompleteListContainer = [
            {
                list: this.nextLocationTargetAutoCompleteList
            }
        ];
    }

    determineActivationStrategy() {
        return activationStrategy.replace; //replace the viewmodel with a new instance
        // or activationStrategy.invokeLifecycle to invoke router lifecycle methods on the existing VM
        // or activationStrategy.noChange to explicitly use the default behavior
    }

    activate(params, routeConfig) {
        this.routeConfig = routeConfig;

        this.gameInfo = this.data.getGameInfo();

        this.setLocation(this.data.getLocation(params.id));

        this.gameNameChangeSubscription = this.observerLocator.getObserver(this.gameInfo, 'name').subscribe(this.updateQRCodeLength.bind(this));

        //return new Promise(resolve => { setTimeout(() => { resolve(); }, 3000); }); // Loading indicator test
    }

    attached() {
        this.eventAggregator.publish(new LocationViewed(this.location));

        this.taskQueue.queueMicroTask(() => {
            this.initializeNextLocationAutoCompleteAll();
        });
    }

    deactivate() {
        if (this.gameNameChangeSubscription) {
            this.gameNameChangeSubscription.dispose();
            this.gameNameChangeSubscription = null;
        }
    }

    setLocation(location) {
        this.location = location;
        this.routeConfig.navModel.setTitle(this.location.locationName);
        //this.originalLocation = this.location.clone();
        this.eventAggregator.publish(new LocationViewed(this.location));

        this.nextLocationTargets.length = 0;
        for (let i = 0; i < this.location.nextLocations.length; i++) {
            this.updateNextLocationTarget(i);
        }

        let locations = this.data.getLocations();
        this.nextLocationTargetAutoCompleteList.length = 0;
        for (let i = 0; i < locations.length; i++) {
            let possibleNextLocation = locations[i];
            if ((possibleNextLocation.id !== location.id) && (possibleNextLocation.locationName)) {
                this.nextLocationTargetAutoCompleteList.push(possibleNextLocation.locationName);
            }
            this.nextLocationTargetAutoCompleteList.sort();
        }

        this.updateQRCodeLength();
    }

    addNextLocation() {
        this.location.nextLocations.push(new NextLocation());
        this.updateQRCodeLength();
        this.taskQueue.queueMicroTask(() => {
            this.initializeNextLocationAutoComplete(this.location.nextLocations.length - 1);
        });
    }

    moveNextLocationUp(index) {
        if (index > 0) {
            this.switchNextLocations(index, index - 1);
        }
    }

    moveNextLocationDown(index) {
        if (index + 1 < this.location.nextLocations.length) {
            this.switchNextLocations(index, index + 1);
        }
    }

    switchNextLocations(indexA, indexB) {
        let nextLocations = this.location.nextLocations;

        var locationA = nextLocations[indexA];
        var locationB = nextLocations[indexB];

        nextLocations.splice(indexA, 1, locationB);
        nextLocations.splice(indexB, 1, locationA);

        // Apparently the splices above are processed in two steps, so the rendering
        // gets updated in two steps too. One queueMicroTask() wouldn't be enough, one
        // of the indizes would still be missing. Ugly and hacky, but it works.
        this.taskQueue.queueMicroTask(() => {
            this.taskQueue.queueMicroTask(() => {
                this.initializeNextLocationAutoComplete(indexA);
                this.initializeNextLocationAutoComplete(indexB);
            });
        });
    }

    removeNextLocation(index) {
        let nextLocation = this.location.nextLocations[index];
        if (!nextLocation.decision && !nextLocation.locationName) {
            this.removeNextLocationNow(index);
        } else {
            openDefaultDeleteConfirmationDialog(this.dialogService,
                "Orts-Übergang wirklich löschen?",
                `"Wenn du ${nextLocation.decision}, dann gehe zu ${nextLocation.locationName}."`,
                () => {
                    this.removeNextLocationNow(index);
                }
            );
        }
    }

    removeNextLocationNow(index) {
        this.location.nextLocations.splice(index, 1);
        this.updateQRCodeLength();
    }

    updateNextLocationTarget(index) {
        let nextLocation = this.location.nextLocations[index];
        let nextLocationTarget = this.data.getTargetLocationFromNextLocation(this.location, nextLocation);
        this.nextLocationTargets[index] = nextLocationTarget;
        //(this.nextLocationTargets.splice(index, 1, this.data.getFirstLocationFilter(location => location.locationName === nextLocation.locationName));
        this.bindingSignaler.signal('update-next-location-target');
        this.bindingSignaler.signal('update-list-location-validity');
        this.updateQRCodeLength();
    }

    getNextLocationTarget(index) {
        return this.nextLocationTargets[index];
    }

    nextLocationTargetClicked(index) {
        let targetLocation = this.nextLocationTargets[index];
        if (!targetLocation) {
            targetLocation = this.data.createLocation();
            targetLocation.locationName = this.location.nextLocations[index].locationName;
        }

        this.router.navigateToRoute('location-editor', { id: targetLocation.id });
    }

    initializeNextLocationAutoCompleteAll() {
        for (let i = 0; i < this.location.nextLocations.length; i++) {
            this.initializeNextLocationAutoComplete(i);
        }
    }

    initializeNextLocationAutoComplete(index) {
        let element = document.querySelector("#next-location-location-name-" + index);

        horsey(element, {
            highlighter: false,
            highlightCompleteWords: false,
            source: this.nextLocationTargetAutoCompleteListContainer,
            filter: this.nextLocationAutoCompleteFilter,
            set: this.nextLocationAutoCompleteSet.bind(this, index)
        });
    }

    nextLocationAutoCompleteFilter(query, suggestion) {
        return suggestion.toLowerCase().includes(query.toLowerCase());
    }

    nextLocationAutoCompleteSet(index, value) {
        this.location.nextLocations[index].locationName = value;
        this.updateNextLocationTarget(index);
        /*
        console.log("nextLocationAutoCompleteSet", element, value);
        $(element).val(value);
        $(element).change();
        */
    }

    deleteLocation() {
        openDefaultDeleteConfirmationDialog(this.dialogService, `Ort "${this.location.locationName}" wirklich löschen?`, "", () => {
            let locations = this.data.getLocations();
            let index = locations.indexOf(this.location);
            if (index !== -1) {
                locations.splice(index, 1);
            }

            this.eventAggregator.publish(new LocationViewed(null));
            this.router.navigateToRoute('overview');
        });
    }

    locationCodeChanged() {
        this.bindingSignaler.signal('update-list');
    }

    locationNameChanged() {
        this.bindingSignaler.signal('update-list-location-validity');
    }

    updateQRCodeLength() {
        this.bindingSignaler.signal('update-qr-code-length');
        this.qrCodeLength = this.location.toQRCodeText(this.gameInfo).length;
        if (this.qrCodeLength <= this.qrCodeMaxLengthWarning) {
            this.qrCodeClass = "well-success";
            this.qrCodeAnalysis = "gute Erkennung";
        } else if (this.qrCodeLength <= this.qrCodeMaxLength) {
            this.qrCodeClass = "well-warning";
            this.qrCodeAnalysis = "möglicherweise problematische Erkennung";
        } else {
            this.qrCodeClass = "well-danger";
            this.qrCodeAnalysis = (this.qrCodeLength - this.qrCodeMaxLength) + " Zeichen zu viel - sehr schlechte Erkennung";
        }
    }
}
