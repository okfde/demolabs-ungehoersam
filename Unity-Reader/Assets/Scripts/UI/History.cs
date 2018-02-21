using System;
using System.Collections.Generic;
using UnityEngine;
using UnityUtilities;

namespace UngehoersamReader
{
    /// <summary>
    /// A display for a certain amount of the last scanned QR codes, allowing to reopen them again without scanning the barcode again.
    /// </summary>
    public class History : SingletonMonoBehaviour<History>
    {
        [SerializeField] HistoryLocationButton historyLocationButtonTemplate;
        [SerializeField] GameObject historyList;
        [SerializeField] GameObject showButtonText;
        [SerializeField] GameObject hideButtonText;
        [SerializeField] int maxItemCount = 5;

        LocationDisplay locationDisplay;

        List<Location> locations;
        List<HistoryLocationButton> locationButtons;

        public event Action EventOpened;
        public event Action EventClosed;

        public bool IsOpen
        {
            get { return historyList.activeSelf; }
        }

        void Awake()
        {
            locationDisplay = LocationDisplay.Instance;

            locations = new List<Location>(maxItemCount);
            locationButtons = new List<HistoryLocationButton>(maxItemCount);

            for (var i = 0; i < maxItemCount; i++)
            {
                var locationButton = (i == 0)
                                        ? historyLocationButtonTemplate
                                        : Instantiate(historyLocationButtonTemplate, historyLocationButtonTemplate.transform.parent);

                locationButton.gameObject.SetActive(false);
                locationButtons.Add(locationButton);

                locations.Add(null);
            }

            UpdateToggleButtonText();
        }

        void UpdateToggleButtonText()
        {
            var isOpen = IsOpen;
            showButtonText.SetActive(!isOpen);
            hideButtonText.SetActive(isOpen);
        }

        public void Add(Location location)
        {
            var lastLocation = locations[0];
            if (lastLocation != null)
            {
                if (lastLocation.QrCodeText.Equals(location.QrCodeText))
                {
                    locations.RemoveAt(0);
                }
            }

            while (locations.Count >= maxItemCount)
            {
                locations.RemoveAt(locations.Count - 1);
            }

            locations.Insert(0, location);

            for (var i = 0; i < maxItemCount; i++)
            {
                var locationButton = locationButtons[i];
                locationButton.Set(locations[i]);
            }
        }

        public void Toggle()
        {
            if (IsOpen)
            {
                Close();
            }
            else
            {
                Open();
            }
        }

        public void Open()
        {
            if (IsOpen)
                return;

            historyList.gameObject.SetActive(true);

            UpdateToggleButtonText();

            if (EventOpened != null)
                EventOpened();
        }

        public void Close()
        {
            if (!IsOpen)
                return;

            historyList.gameObject.SetActive(false);

            UpdateToggleButtonText();

            if (EventClosed != null)
                EventClosed();
        }

        public void OpenLocation(Location location)
        {
            //Close();
            locationDisplay.Open(location);
        }
    }
}
