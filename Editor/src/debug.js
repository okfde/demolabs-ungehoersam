import {qrcode} from 'qrcode';
import {inject} from 'aurelia-framework';
import {Data} from "./data";
import {Location, NextLocation} from "./location"

/**
 * A debug component used to create test data and display an example QR code to test the QR code library.
 */
@inject(Data)
export class Debug {
    text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n" +
        "Why do we use it?\n" +
        "\n" +
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).\n" +
        "\n" +
        "Where does it come from?Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.\n" +
        "Why do we use it?[ENDE]";

    constructor(data) {
        this.data = data;
    }

    createTestData() {
        var locations = this.data.getLocations();
        locations.push(new Location(this.data.getNextLocationId(), 'B', 'Berlin', 'Das Schloss', 'Ein paar Formatierungen: *Kursiv* und **fett**.\n\nUnd ein zweiter Absatz!', [
            new NextLocation('ans Wasser willst', 'Hamburg'),
            new NextLocation('zur Mitte möchtest', 'Kassel')
        ])),
        locations.push(new Location(this.data.getNextLocationId(), '1', 'Hamburg', 'Am Hafen', 'Direkt am Wasser.'));
        locations.push(new Location(this.data.getNextLocationId(), 'K', 'Kassel', 'Im Märchenwald', 'Die Mitte von allem.'));
    }
}