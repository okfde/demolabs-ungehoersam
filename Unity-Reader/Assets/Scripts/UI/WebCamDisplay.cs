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
        
        object refreshTracker;

        /*
        Texture2D texture;
        Color32[] colors;
        int width;
        int height;
        int lastFillColorsFrame;
        */

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
            /*
            // Test FillColors
            if (webCam.Ready)
            {
                webCam.CameraSource.FillColors(ref colors, ref width, ref height, ref lastFillColorsFrame);
                if (texture == null)
                {
                    texture = new Texture2D(width, height, TextureFormat.RGBA32, false);
                    rawImage.texture = texture;
                }

                texture.SetPixels32(colors);
                texture.Apply();
            }
            */

            rawImage.enabled = webCam.CameraSource.IsPlaying;
            
            if (rawImage.enabled)
                webCam.CameraSource.RefreshView(rectTransform, rawImage, aspectRatioFitter, ref refreshTracker);
        }
    }
}