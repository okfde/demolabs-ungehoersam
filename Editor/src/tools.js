import {Location} from "./location";
import {Data} from "./data";
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {DialogService} from 'aurelia-dialog';
import {DialogInfo} from "./dialog-info";
import {openDefaultDeleteConfirmationDialog} from "./utility";

/**
 * The tools panel component.
 */
@inject(Data, Router, DialogService)
export class Tools {
    constructor(data, router, dialogService) {
        this.data = data;
        this.router = router;
        this.dialogService = dialogService;
    }

    deleteEverything() {
        openDefaultDeleteConfirmationDialog(this.dialogService, "Alles löschen? Sicher?", "", () => {
            this.data.deleteAll();
            this.dialogService.open({viewModel: DialogInfo, model: {title: 'Spiel-Info und Orte gelöscht.'}});
        });
    }

    saveDataToJSON() {
        var json = this.data.saveDataToJSON();
        this.downloadFile(json);
    }

    downloadFile(text) {
        var data = new Blob([text], {type: 'application/x-please-download-me'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (this.textFile !== null) {
            window.URL.revokeObjectURL(this.textFile);
        }

        this.textFile = window.URL.createObjectURL(data);

        this.invisibleDownloadIFrame.src = this.textFile;
    }
}
