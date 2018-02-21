import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

/**
 * A dialog window showing the user that a new version of the app is being downloaded.
 */
@inject(DialogController)
export class DialogCacheDownloading {
    constructor(dialogController) {
        this.dialogController = dialogController;
    }

    activate(data) {
        this.data = data;
    }
}
