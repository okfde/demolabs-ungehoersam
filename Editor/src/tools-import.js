import {Location} from "./location";
import {Data} from "./data";
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {DialogService} from 'aurelia-dialog';
import {DialogInfo} from "./dialog-info";
import {openDefaultDeleteConfirmationDialog} from "./utility";

/**
 * The import component, allowing to upload previously exported JSON files and add them to (or overwrite) the current
 * Location list and GameData in Data.
 */
@inject(Data, Router, DialogService)
export class ToolsImport {
    constructor(data, router, dialogService) {
        this.data = data;
        this.router = router;
        this.dialogService = dialogService;
    }

    updateFilesSelect(event) {
        this.importError = null;
        this.importData = null;

        let sizeKB = 1024;

        let file = event.target['files'][0];
        if (file.size > sizeKB * 100) {
            this.importError = "Dateigröße ist " + Math.floor(file.size / sizeKB) + "KB - eindeutig zu groß für eine Export-Datei.";
            return;
        }

        var reader = new FileReader();

        reader.onload = () => {
            this.processResult(reader.result);
        };

        reader.readAsText(file);
    }

    processResult(str) {
        try {
            let data = this.data.getDataFromJSON(str);
            this.importData = data;
        } catch (err) {
            this.importError = `Datei hat ein ungültiges Format. (${err})`;
        }
    }

    clear() {
        this.importError = null;
        this.importData = null;
        this.importFile.value = null;
    }

    import() {
        if (this.importDeleteCurrentLocations) {
            openDefaultDeleteConfirmationDialog(this.dialogService, "Wirklich alle aktuellen Orte vor dem Import löschen?", "", this.executeImport.bind(this));
        } else {
            this.executeImport();
        }
    }

    executeImport() {
        if (this.importGameInfo) {
            var gameInfo = this.data.getGameInfo();
            Object.assign(gameInfo, this.importData.gameInfo);
        }

        var locations = this.data.getLocations();

        if (this.importDeleteCurrentLocations) {
            locations.splice(0, locations.length);
        }

        for (let location of this.importData.locations) {
            location.id = this.data.getNextLocationId();
            locations.push(location);
        }

        this.clear();

        this.dialogService.open({ viewModel: DialogInfo, model: {title: 'Import erfolgreich!' } });
    }
}
