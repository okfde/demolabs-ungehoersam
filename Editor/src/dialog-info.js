import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

/**
 * An information dialog window, displaying content with an icon.
 */
@inject(DialogController)
export class DialogInfo {
    constructor(dialogController) {
        this.dialogController = dialogController;
    }

    activate(data) {
        data.icon = data.icon ? data.icon : "fa-check";
        this.data = data;
    }
}
