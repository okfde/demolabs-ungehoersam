using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An <see cref="ICameraSource"/> implementation using the Unity component <see cref="WebCamTexture"/>.
    /// </summary>
    public class UnityWebCamCameraSource : ICameraSource
    {
        class RefreshTracker
        {
            float aspectRatio;
            int videoRotationAngle;
            bool videoVerticallyMirrored;

            public void Set(float aspectRatio, int videoRotationAngle, bool videoVerticallyMirrored)
            {
                this.aspectRatio = aspectRatio;
                this.videoRotationAngle = videoRotationAngle;
                this.videoVerticallyMirrored = videoVerticallyMirrored;
            }

            public bool IsRefreshNeeded(float aspectRatio, int videoRotationAngle, bool videoVerticallyMirrored)
            {
                return this.aspectRatio != aspectRatio ||
                       this.videoRotationAngle != videoRotationAngle ||
                       this.videoVerticallyMirrored != videoVerticallyMirrored;
            }
        }

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

        public bool IsPlaying
        {
            get { return webCamTexture.isPlaying; }
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

        public void RefreshView(RectTransform rectTransform, RawImage rawImage, AspectRatioFitter aspectRatioFitter, ref object refreshTracker)
        {
            if (!webCamTexture.isPlaying)
                return;

            var aspectRatio = (float)webCamTexture.width / webCamTexture.height;
            var videoRotationAngle = webCamTexture.videoRotationAngle;
            var videoVerticallyMirrored = webCamTexture.videoVerticallyMirrored;
            
            RefreshTracker castRefreshTracker;
            if (refreshTracker == null)
            {
                castRefreshTracker = new RefreshTracker();
                refreshTracker = castRefreshTracker;
            }
            else
            {
                castRefreshTracker = (RefreshTracker) refreshTracker;
                if (!castRefreshTracker.IsRefreshNeeded(aspectRatio, videoRotationAngle, videoVerticallyMirrored))
                    return;
            }

            castRefreshTracker.Set(aspectRatio, videoRotationAngle, videoVerticallyMirrored);

            var angleCW = videoRotationAngle;
            var angleCCW = -angleCW;

            if (videoVerticallyMirrored)
                angleCCW += 180;

            rectTransform.localEulerAngles = new Vector3(0f, 0f, angleCCW);

            aspectRatioFitter.aspectRatio = aspectRatio;

            rawImage.uvRect = videoVerticallyMirrored
                                ? new Rect(0, 0, 1, -1) // flip on vertical axis
                                : new Rect(0, 0, 1, 1); // no flip
        }
        
        public int FrameCounter { get { return frameCounter; } }

        public void SetActive(bool active)
        {
            /*
            if (active == webCamTexture.isPlaying)
                return;
            */

            if (active)
            {
                webCamTexture.Play();
            }
            else
            {
                webCamTexture.Pause();
            }
        }
    }
}
