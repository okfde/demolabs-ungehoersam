using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An <see cref="ICameraSource"/> implementation using the Unity component <see cref="WebCamTexture"/>.
    /// </summary>
    public class UnityWebCamCameraSource : ICameraSource
    {
        WebCamTexture webCamTexture;
        int frameCounter;

        public UnityWebCamCameraSource()
        {
            webCamTexture = new WebCamTexture();
            webCamTexture.Play();

            frameCounter = 0;
        }

        public bool Ready
        {
            get { return webCamTexture.width > 100; }
        }

        public Texture Texture
        {
            get { return webCamTexture; }
        }

        public void Update()
        {
            UpdateFrameCounter();
        }

        void UpdateFrameCounter()
        {
            if (webCamTexture.didUpdateThisFrame)
            {
                frameCounter = Time.frameCount;
            }
        }

        public bool FillColors(ref Color32[] colors, ref int width, ref int height, ref int lastFillColorsFrame)
        {
            if (!webCamTexture.isPlaying)
                return false;

            UpdateFrameCounter();

            if (lastFillColorsFrame == frameCounter)
                return false;

            lastFillColorsFrame = frameCounter;

            width = webCamTexture.width;
            height = webCamTexture.height;
            var length = width * height;
            if ((colors == null) || (colors.Length != length))
            {
                colors = new Color32[length];
            }

            webCamTexture.GetPixels32(colors);
            return true;
        }

        public bool RefreshView(RectTransform rectTransform, RawImage rawImage, AspectRatioFitter aspectRatioFitter)
        {
            if (!webCamTexture.isPlaying)
                return false;

            int angleCW = webCamTexture.videoRotationAngle;
            int angleCCW = -angleCW;

            if (webCamTexture.videoVerticallyMirrored)
                angleCCW += 180;

            rectTransform.localEulerAngles = new Vector3(0f, 0f, angleCCW);

            aspectRatioFitter.aspectRatio = (float)webCamTexture.width / webCamTexture.height;

            rawImage.uvRect = webCamTexture.videoVerticallyMirrored
                                ? new Rect(0, 0, 1, -1) // flip on vertical axis
                                : new Rect(0, 0, 1, 1); // no flip

            return true;
        }

        /*
        public void SetActive(bool active)
        {
            if (active == webCamTexture.isPlaying)
                return;

            if (active)
            {
                webCamTexture.Play();
            }
            else
            {
                webCamTexture.Pause();
            }
        }
        */
    }
}
