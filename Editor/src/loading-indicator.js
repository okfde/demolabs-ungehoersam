import * as nprogress from 'nprogress';
import {bindable, noView} from 'aurelia-framework';

/**
 * A loading indicator.
 */
@noView(['nprogress/nprogress.css'])
export class LoadingIndicator {
    @bindable loading = false;

    loadingChanged(newValue) {
        if (newValue) {
            nprogress.start();
        } else {
            nprogress.done();
        }
    }
}
