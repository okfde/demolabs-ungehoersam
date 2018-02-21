import {DialogConfirmation} from "./dialog-confirmation";

/***
 * Checks whether x and y is equal in all properties, even if it's not the same object.
 * areEqual(o, JSON.parse(JSON.stringify(o))) === true.
 *
 * @param x The first object or primitive
 * @param y The second object or primitive
 * @returns {boolean} true if x and y are equal in all properties, else false.
 */
export function areEqual(x, y) {
    if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
        if (Object.keys(x).length != Object.keys(y).length) {
            return false;
        }

        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!areEqual(x[prop], y[prop]))
                    return false;
            }
            else {
                return false;
            }
        }

        return true;
    } else if (x !== y) {
        return false;
    } else {
        return true;
    }
}

/*
export function areEqual(obj1, obj2) {
	return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && (obj1[key] === obj2[key]));
};
*/

/**
 * Deep-clones an object via JSON.stringify.
 *
 * @param o The object to be cloned
 * @returns The cloned object
 */
export function cloneData(o) {
    return JSON.parse(JSON.stringify(o));
}

/**
 * Brings an integer to two digits by prefixing a 0 if is less than 10.
 * @param i The integer to be prefixed
 * @returns [number} A two or more-digit integer.
 */
export function formatTwoDigits(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

/**
 * A list of conversions for escaping HTML.
 * @type {{&: string, <: string, >: string, ": string, ': string, /: string, `: string, =: string}}
 */
var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

/**
 * Escapes an HTML string by replacing &, <, >, ", ', /, ` and = with their ampersand character codes.
 * @param string
 * @returns {string}
 */
export function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

/**
 * Iteratively replaces all occurences of <serach> with <replacement> in str.
 * @param str The string to replace in.
 * @param search The search string.
 * @param replacement The replacement string.
 * @returns {string} The string with all occurences of <search> replaced by <replacement>.
 */
export function replaceAll(str, search, replacement) {
    while (str.indexOf(search) !== -1) {
        str = str.replace(search, replacement);
    }
    return str;
}

/**
 * Opens a default deletion confirmation dialog.
 * @param dialogService The DialogService service.
 * @param title The title of the dialog box.
 * @param content The content of the dialog box.
 * @param okCallback The function to be called when the user presses "Löschen" ("delete").
 * @param cancelCallback The function to be called when the user presses "Abbrechen" ("cancel").
 */
export function openDefaultDeleteConfirmationDialog(dialogService, title, content, okCallback, cancelCallback) {
    dialogService.open({ viewModel: DialogConfirmation, model: {
        title: title,
        content: content,
        ok: "Löschen",
        okIcon: 'fa-trash-o',
        okClass: "btn-danger",
        cancel: "Abbrechen",
        cancelIcon: 'fa-ban',
        cancelClass: 'btn-normal',
    }, lock: true }).whenClosed(response => {
        if (response.wasCancelled) {
            if (cancelCallback) {
                cancelCallback();
            }
        } else {
            if (okCallback) {
                okCallback();
            }
        }
    });
}
