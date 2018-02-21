using UnityEngine;

namespace UngehoersamReader
{
    /// <summary>
    /// A state manager to switch between scanning, <see cref="History"/> and <see cref="LocationDisplay"/>.
    /// </summary>
    public class StateManager : MonoBehaviour
    {
        //[SerializeField] WebCam webCam;
        [SerializeField] GameObject moveQRCodeHereHelper;
        [SerializeField] GameObject historyToggleButton;

        History history;
        LocationDisplay locationDisplay;
        QRCodeReader qrCodeReader;

        void Awake()
        {
            history = History.Instance;
            locationDisplay = LocationDisplay.Instance;
            qrCodeReader = QRCodeReader.Instance;

            history.Close();
            locationDisplay.Close();

            UpdateState();
        }

        void OnEnable()
        {
            history.EventOpened += UpdateState;
            history.EventClosed += UpdateState;
            locationDisplay.EventOpened += UpdateState;
            locationDisplay.EventClosed += UpdateState;
        }

        void OnDisable()
        {
            history.EventOpened -= UpdateState;
            history.EventClosed -= UpdateState;
            locationDisplay.EventOpened -= UpdateState;
            locationDisplay.EventClosed -= UpdateState;
        }

        void UpdateState()
        {
            var windowOpen = history.IsOpen || locationDisplay.IsOpen;
            var shouldRead = !windowOpen;

            //webCam.CameraSource.SetActive(shouldRead);
            qrCodeReader.Reading = shouldRead;
            moveQRCodeHereHelper.SetActive(shouldRead);

            historyToggleButton.SetActive(!locationDisplay.IsOpen);
        }
    }
}
