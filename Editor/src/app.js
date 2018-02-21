import {inject} from 'aurelia-framework';
import {Data} from "./data";

/**
 * The entry component of the app, defining the sub routes and providing a basic layout.
 */
@inject(Data)
export class App {
    constructor(data) {
        this.data = data;
    }

    configureRouter(config, router) {
        config.title = 'Ungehörsam';
        config.map([
            { route: '',         redirect: 'overview' },
            { route: 'overview', name: 'overview', moduleId: 'overview', nav: true, settings: 'fa-home' },
            { route: 'print', name: 'print', moduleId: 'print', nav: true, settings: 'fa-print' },
            { route: 'tools', name: 'tools', moduleId: 'tools', nav: true, settings: 'fa-cog' },
            { route: 'debug', moduleId: 'debug' },
            { route: 'about', name: 'about', moduleId: 'about' }
        ]);

        config.fallbackRoute('overview');

        this.router = router;
    }

    activate(params, routeConfig) {
        return this.data.ensureDataIsLoaded();
    }
}
