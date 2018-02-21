using System;
using System.Collections;
using NatCamU.Core;
using UnityEngine;

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
#if NATCAM_PROFESSIONAL
            NatCam
#endif
        }

        [SerializeField] CameraType cameraType;
#if NATCAM_PROFESSIONAL
        [SerializeField] ResolutionPreset natCamResolutionPreset;
#endif

        public ICameraSource CameraSource { get; private set; }
        public bool Ready { get; private set; }

        public event Action EventCameraIsReady;

        void Awake()
        {
            switch (cameraType)
            {
                case CameraType.UnityWebCam:
                    CameraSource = new UnityWebCamCameraSource();
                    break;

#if NATCAM_PROFESSIONAL
                case CameraType.NatCam:
                    CameraSource = new NatCamCameraSource(natCamResolutionPreset);
                    break;
#endif

                default:
                    throw new NotImplementedException(cameraType.ToString());
            }
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
    }
}