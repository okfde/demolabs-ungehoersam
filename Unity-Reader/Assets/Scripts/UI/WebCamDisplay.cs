using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// Displays the webcam image of the <see cref="ICameraSource"/> of a <see cref="WebCam"/> in a <see cref="RawImage"/>, using an <see cref="AspectRatioFitter"/>
    /// to keep the correct aspect ratio.
    /// </summary>
    [RequireComponent(typeof(RectTransform), typeof(RawImage), typeof(AspectRatioFitter))]
    public class WebCamDisplay : MonoBehaviour
    {
        [SerializeField] WebCam webCam;

        RectTransform rectTransform;
        RawImage rawImage;
        AspectRatioFitter aspectRatioFitter;

        void Awake()
        {
            rectTransform = GetComponent<RectTransform>();
            rawImage = GetComponent<RawImage>();
            aspectRatioFitter = GetComponent<AspectRatioFitter>();

            if (webCam.Ready)
            {
                InitializeCamera();
            }
            else
            {
                webCam.EventCameraIsReady += OnCameraIsReady;
            }
        }

        void OnCameraIsReady()
        {
            webCam.EventCameraIsReady -= OnCameraIsReady;
            InitializeCamera();
        }

        void InitializeCamera()
        {
            rawImage.texture = webCam.CameraSource.Texture;
        }

        void LateUpdate()
        {
            rawImage.enabled = webCam.CameraSource.RefreshView(rectTransform, rawImage, aspectRatioFitter);
        }
    }
}