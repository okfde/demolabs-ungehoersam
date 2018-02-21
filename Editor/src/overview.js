/**
 * The layout for the editing part of the app, showing a Location overview and an edit form or QR code view for the
 * currently selected location.
 */
export class ChildRouter {
    configureRouter(config, router) {
        config.map([
            { route: '', name: 'location-no-selection', moduleId: 'location-no-selection' },
            { route: 'edit', name: 'location-editor', moduleId: 'location-editor' },
            { route: 'qr', name: 'location-qr-code-display', moduleId: 'location-qr-code-display' }
        ]);

        this.router = router;
    }
}
