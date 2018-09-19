#if NATCAM
using System.Runtime.InteropServices;
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
        /*
        class RefreshTracker
        {
            float aspectRatio;

            public void Set(float aspectRatio)
            {
                this.aspectRatio = aspectRatio;
            }
            
            public bool IsRefreshNeeded(float aspectRatio)
            {
                return this.aspectRatio != aspectRatio;
            }
        }
        */
        
        object threadLock = new object();
        int frameCounter;
        byte[] rawFrameBytes;

        public NatCamCameraSource(CameraResolution cameraResolution)
        {
            NatCam.Camera = DeviceCamera.RearCamera ?? DeviceCamera.FrontCamera;
            NatCam.Camera.PreviewResolution = cameraResolution;
            //NatCam.Camera.Framerate = FrameratePreset.Default;
            
            if (!Application.isEditor) // "NatCam Error: Focus mode is not supported on legacy"
            {
                NatCam.Camera.FocusMode = FocusMode.AutoFocus;
            }

            NatCam.Play();

            NatCam.OnStart += OnStart;
            NatCam.OnFrame += OnFrame;

            frameCounter = 0;
        }

        void OnStart()
        {
            NatCam.OnStart -= OnStart;

            Ready = true;
            IsPlaying = true;
        }

        public bool Ready { get; private set; }
    
        public bool IsPlaying { get; private set; }

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
            return PreviewBuffer(ref colors, out width, out height);
        }
        
        bool PreviewBuffer(ref Color32[] colors, out int width, out int height)
        {
            width = NatCam.Preview.width;
            height = NatCam.Preview.height;
            var pixelCount = width * height;
            var rawFrameBytesCount = pixelCount * 4;

            lock (threadLock)
            {
                if ((rawFrameBytes == null) || (rawFrameBytes.Length != rawFrameBytesCount))
                    rawFrameBytes = new byte[rawFrameBytesCount];

                if (!NatCam.CaptureFrame(rawFrameBytes))
                    return false;

                if ((colors == null) || (colors.Length != pixelCount))
                    colors = new Color32[pixelCount];

                var handle = GCHandle.Alloc(colors, GCHandleType.Pinned);
                Marshal.Copy(rawFrameBytes, 0, handle.AddrOfPinnedObject(), rawFrameBytesCount);
                handle.Free();
            }

            return true;
        }

        public void RefreshView(RectTransform rectTransform, RawImage rawImage, AspectRatioFitter aspectRatioFitter, ref object refreshTracker)
        {
            /*
            // We could check this in the beginning, but I think it's better to keep those calls to a minimum.
            if (!NatCam.IsPlaying)
                return;
            */

            var preview = NatCam.Preview;
            if (!preview)
                return;
            
            var aspectRatio = (float) preview.width / preview.height;
            
            // We could use a RefreshTracker here, but it's probably faster to just assign the
            // aspectRatio and let the property take care of not refreshing.
            /*
            RefreshTracker castRefreshTracker;
            if (refreshTracker == null)
            {
                castRefreshTracker = new RefreshTracker();
                refreshTracker = castRefreshTracker;
            }
            else
            {
                castRefreshTracker = (RefreshTracker) refreshTracker;
                if (!castRefreshTracker.IsRefreshNeeded(aspectRatio))
                    return;
            }

            castRefreshTracker.Set(aspectRatio);
            */

            aspectRatioFitter.aspectRatio = aspectRatio;
        }

        public int FrameCounter { get { return frameCounter; } }

        public void SetActive(bool active)
        {
            /*
            if (active == NatCam.IsPlaying)
                return;
            */

            if (active)
            {
                NatCam.Play();
                IsPlaying = true;
            }
            else
            {
                NatCam.Pause();
                IsPlaying = false;
            }
        }
    }
}
#endif