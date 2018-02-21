import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

/**
 * A dialog window showing that there is a new version available and prompting the user to reload to get it.
 */
@inject(DialogController)
export class DialogCacheRefresh {
    constructor(dialogController) {
        this.dialogController = dialogController;
    }

    activate(data) {
        this.data = data;
    }

    refresh() {
        location.reload();
    }
}
