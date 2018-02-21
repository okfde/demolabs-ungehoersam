#if NATCAM_PROFESSIONAL
using NatCamU.Core;
using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An <see cref="ICameraSource"/> implementation using the commercial <see cref="NatCam"/>.
    /// </summary>
    public class NatCamCameraSource : ICameraSource
    {
        int frameCounter;

        public NatCamCameraSource(ResolutionPreset resolutionPreset)
        {
            NatCam.Camera = DeviceCamera.RearCamera ?? DeviceCamera.FrontCamera;
            NatCam.Camera.SetPreviewResolution(resolutionPreset);
            NatCam.Camera.SetFramerate(FrameratePreset.Default);
            NatCam.Camera.FocusMode = FocusMode.AutoFocus;
            NatCam.Play();

            NatCam.OnStart += OnStart;
            NatCam.OnFrame += OnFrame;

            frameCounter = 0;
        }

        void OnStart()
        {
            NatCam.OnStart -= OnStart;

            Ready = true;
        }

        public bool Ready { get; private set; }

        public Texture Texture
        {
            get { return NatCam.Preview; }
        }

        void OnFrame()
        {
            frameCounter++;
        }

        public void Update()
        {
        }

        public bool FillColors(ref Color32[] colors, ref int width, ref int height, ref int lastFillColorsFrame)
        {
            if (!NatCam.IsPlaying)
                return false;

            if (lastFillColorsFrame == frameCounter)
                return false;

            lastFillColorsFrame = frameCounter;
            return NatCam.PreviewBuffer(ref colors, out width, out height);
        }

        public bool RefreshView(RectTransform rectTransform, RawImage rawImage, AspectRatioFitter aspectRatioFitter)
        {
            if (!NatCam.IsPlaying)
                return false;

            var size = NatCam.Camera.PreviewResolution;

#if (UNITY_IOS || UNITY_ANDROID) && !UNITY_EDITOR
            var aspectRatio = size.y / size.x; // Other way around, because we are only doing portrait and width/height doesn't change in NatCam then.
#else
            var aspectRatio = size.x / size.y;
#endif

            aspectRatioFitter.aspectRatio = aspectRatio;
            return true;
        }

        /*
        public void SetActive(bool active)
        {
            if (active == NatCam.IsPlaying)
                return;

            if (active)
            {
                NatCam.Play();
            }
            else
            {
                NatCam.Pause();
            }
        }
        */
    }
}
#endif