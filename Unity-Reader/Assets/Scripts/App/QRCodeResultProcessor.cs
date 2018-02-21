using System;
using UnityEngine;

namespace UngehoersamReader
{
    /// <summary>
    /// Subscribes to the QR codes delivered by <see cref="QRCodeReader"/>. If one is found and can be parsed by<see cref="Location.Parse"/>,
    /// it is added to the <see cref="History"/> and opened by the <see cref="LocationDisplay"/>.
    /// </summary>
    public class QRCodeResultProcessor : MonoBehaviour
    {
        [SerializeField] QRCodeReader qrCodeReader;

        [SerializeField] bool useDebugTextInEditor;
        [SerializeField] [TextArea] string debugText;

        History history;
        LocationDisplay locationDisplay;

        void Awake()
        {
            history = History.Instance;
            locationDisplay = LocationDisplay.Instance;
        }

        void OnEnable()
        {
            qrCodeReader.EventRecognized += OnQRCodeRecognized;
        }

        void OnDisable()
        {
            qrCodeReader.EventRecognized -= OnQRCodeRecognized;
        }

        void Start()
        {
            if (Application.isEditor && useDebugTextInEditor)
            {
                OnQRCodeRecognized(debugText);
            }
        }

        void OnQRCodeRecognized(string qrCodeText)
        {
            Debug.Log("QR code found!\n" + qrCodeText);

            var location = Location.Parse(qrCodeText, DateTime.Now);
            if (location == null)
                return;

            history.Add(location);
            locationDisplay.Open(location);
        }
    }
}
