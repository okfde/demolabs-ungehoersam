import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {DialogCacheRefresh} from "./dialog-cache-refresh";
import {DialogCacheDownloading} from "./dialog-cache-downloading";
import {DialogInfo} from "./dialog-info";

/**
 * The CacheUpdateChecker uses windows.applicationCache to find out if a new version exists and displays various
 * notifications depending on the download status.
 */
@inject(DialogService)
export class CacheUpdateChecker {
    constructor(dialogService) {
        this.dialogService = dialogService;
    }

    attached() {
        this.attachedTime = new Date();
        var appCache = window.applicationCache;
        if (appCache.status == appCache.UPDATEREADY) {
            this.updateAvailable();
        } else {
            if (appCache.status == appCache.DOWNLOADING) {
                this.startedDownloading();
            }
            else {
                appCache.addEventListener('downloading', this.startedDownloading.bind(this), false);
            }
            appCache.addEventListener('updateready', this.updateAvailable.bind(this), false);
        }
    }

    startedDownloading() {
        this.dialogService.open({ viewModel: DialogCacheDownloading, model: null }).then(result => {
            this.loadingDialogController = result.controller;

            var appCache = window.applicationCache;
            if (appCache.status != appCache.DOWNLOADING) {
                this.closeLoadingDialogIfOpen();
            } else {
                appCache.addEventListener('error', this.downloadingError.bind(this), false);
                appCache.addEventListener('cached', this.closeLoadingDialogIfOpen.bind(this), false);
            }
        });
    }

    updateAvailable() {
        let timeSinceAttachedMS = (new Date() - this.attachedTime);
        let timeSinceAttachedS = timeSinceAttachedMS / 1000;
        if (timeSinceAttachedS < 3) {
            location.reload();
        } else {
            this.closeLoadingDialogIfOpen();
            this.dialogService.open({ viewModel: DialogCacheRefresh, model: null });
        }
    }

    downloadingError() {
        this.closeLoadingDialogIfOpen();
        this.dialogService.open({ viewModel: DialogInfo, model: {title: "Herunterladen der neuen Version fehlgeschlagen.", icon: "fa-times"} });
    }

    closeLoadingDialogIfOpen() {
        if (this.loadingDialogController) {
            this.loadingDialogController.close();
            this.loadingDialogController = null;
        }
    }
}
