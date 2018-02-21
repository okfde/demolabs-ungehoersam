import {qrcode} from 'qrcode';

/**
 * A service class creating jpeg QR code images from text.
 */
export class QrCodeService {
    createQRCodeImageTag(str) {
        let typeNumber = 0;
        let errorCorrectionLevel = 'L';
        let qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(str);
        qr.make();
        return qr.createImgTag(null, 0);
    }

    createQRCodeImageJpeg(str) {
        return new Promise(resolve => {
            let imageTag = $(this.createQRCodeImageTag(str));
            let image = imageTag.attr('src');
            let imageWidth = imageTag.attr('width');
            let imageHeight = imageTag.attr('height');

            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            canvas.width = imageWidth;
            canvas.height = imageHeight;

            let img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
                image = canvas.toDataURL("image/jpeg");
                resolve({image: image, imageWidth: imageWidth, imageHeight: imageHeight});
            }
            img.src = image;
        });
    }
}