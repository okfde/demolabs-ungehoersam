using System;
using System.Collections;
using UnityEngine;
#if NATCAM
using NatCamU.Core;
#endif

namespace UngehoersamReader
{
    /// <summary>
    /// The Unity component which manages and encapsulates the active <see cref="ICameraSource"/>.
    /// </summary>
    public class WebCam : MonoBehaviour
    {
        enum CameraType
        {
            UnityWebCam,
            NatCam
        }

        enum NatCamResolution
        {
            ResolutionHighest,
            ResolutionLowest,
            Resolution640x480,
            Resolution1280x720,
            Resolution1920x1080
        }

        [SerializeField] CameraType cameraType;
        [SerializeField] NatCamResolution natCamResolution;

        public ICameraSource CameraSource { get; private set; }
        public bool Ready { get; private set; }

        public event Action EventCameraIsReady;

        void Awake()
        {
#if !NATCAM
            cameraType = CameraType.UnityWebCam;
#endif
            
            switch (cameraType)
            {
                case CameraType.UnityWebCam:
                    CameraSource = new UnityWebCamCameraSource();
                    break;

                case CameraType.NatCam:
#if NATCAM
                    CameraSource = new NatCamCameraSource(ConvertToResolution(natCamResolution));
#endif
                    break;

                default:
                    throw new NotImplementedException(cameraType.ToString());
            }
            
            Debug.Log("Initialized camera source: " + CameraSource);
        }

        IEnumerator Start()
        {
            while (!CameraSource.Ready)
                yield return null;

            Ready = true;

            if (EventCameraIsReady != null)
                EventCameraIsReady();
        }

        void Update()
        {
            CameraSource.Update();
        }

#if NATCAM
        static CameraResolution ConvertToResolution(NatCamResolution natCamResolution)
        {
            switch (natCamResolution)
            {
                case NatCamResolution.Resolution640x480:
                    return CameraResolution._640x480;

                case NatCamResolution.Resolution1280x720:
                    return CameraResolution._1280x720;

                case NatCamResolution.Resolution1920x1080:
                    return CameraResolution._1920x1080;

                case NatCamResolution.ResolutionHighest:
                    return CameraResolution.Highest;

                case NatCamResolution.ResolutionLowest:
                    return CameraResolution.Lowest;
                
                default:
                    throw new NotImplementedException(natCamResolution.ToString());
            }
        }
#endif
    }
}