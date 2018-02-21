import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

/**
 * A confirmation (yes/no?) dialog window.
 */
@inject(DialogController)
export class DialogConfirmation {
    constructor(dialogController) {
        this.dialogController = dialogController;
    }

    activate(data) {
        this.data = data;
    }
}
