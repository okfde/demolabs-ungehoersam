using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityUtilities;

namespace UngehoersamReader
{
    /// <summary>
    /// This component displays a <see cref="Location"/> and starts description playback via <see cref="TextToSpeechManager"/>.
    /// </summary>
    public class LocationDisplay : SingletonMonoBehaviour<LocationDisplay>
    {
        [SerializeField] GameObject panel;
        [SerializeField] Text qrCodeText;
        [SerializeField] Text sceneNameText;
        [SerializeField] Text descriptionText;
        [SerializeField] Text nextLocationInfoLocationNameText;
        [SerializeField] LocationDisplayNextLocation nextLocationDisplayTemplate;
        [SerializeField] GameObject chooseLocationsArea;
        [SerializeField] GameObject chosenLocationInfoArea;
        [SerializeField] GameObject closeButtonNormal;
        [SerializeField] GameObject closeButtonHighlighted;
        [SerializeField] GameObject speechArea;
        [SerializeField] GameObject speechButtonPlay;
        [SerializeField] GameObject speechButtonStop;
        [SerializeField] bool autoPlayDescription = false;

        public event Action EventOpened;
        public event Action EventClosed;

        TextToSpeechManager textToSpeechManager;

        List<LocationDisplayNextLocation> nextLocationDisplays = new List<LocationDisplayNextLocation>();

        void Awake()
        {
            nextLocationDisplayTemplate.gameObject.SetActive(false);

            textToSpeechManager = TextToSpeechManager.Instance;
            textToSpeechManager.EventSpeechStarted += OnSpeechStarted;
            textToSpeechManager.EventSpeechComplete += OnSpeechStopped;
            textToSpeechManager.EventInitialized += OnSpeechInitialized;

            speechArea.gameObject.SetActive(false);
            speechButtonPlay.gameObject.SetActive(true);
            speechButtonStop.gameObject.SetActive(false);

            if (textToSpeechManager.IsInitialized)
            {
                OnSpeechInitialized();
            }
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            textToSpeechManager.EventSpeechStarted -= OnSpeechStarted;
            textToSpeechManager.EventSpeechComplete -= OnSpeechStopped;
            textToSpeechManager.EventInitialized -= OnSpeechInitialized;
        }

        public bool IsOpen
        {
            get { return panel.activeSelf; }
        }

        public void Open(Location location)
        {
            if ((qrCodeText.text != null) && (qrCodeText.isActiveAndEnabled))
            {
                qrCodeText.text = location.QrCodeText;
            }

            sceneNameText.text = location.SceneName;
            descriptionText.text = location.Description;

            var nextLocationsCount = location.NextLocations.Length;
            for (var i = 0; i < nextLocationsCount; i++)
            {
                var nextLocation = location.NextLocations[i];
                var isLastNextLocation = i == (nextLocationsCount - 1);
                var nextLocationDisplay = GetOrCreateNextLocationDisplay(i);
                nextLocationDisplay.Set(nextLocation, isLastNextLocation);
                nextLocationDisplay.gameObject.SetActive(true);
            }

            for (var i = nextLocationsCount; i < nextLocationDisplays.Count; i++)
            {
                nextLocationDisplays[i].gameObject.SetActive(false);
            }

            //Debug.LogFormat("Location meta info: {0}.{1}.{2}, {3}", location.EditorVersionMajor, location.EditorVersionMinor, location.EditorVersionPatch, location.GameName);

            panel.SetActive(true);

            ShowChooseLocationArea();

            if (autoPlayDescription)
                PlayDescription();

            if (EventOpened != null)
                EventOpened();
        }

        public void ShowChooseLocationArea()
        {
            SetChooseLocationAreaVisibility(true);
        }

        public void ShowNextLocationInfo(NextLocation nextLocation)
        {
            nextLocationInfoLocationNameText.text = nextLocation.LocationName;
            SetChooseLocationAreaVisibility(false);
        }

        void SetChooseLocationAreaVisibility(bool chooseAreaOpen)
        {
            chooseLocationsArea.SetActive(chooseAreaOpen);
            closeButtonNormal.SetActive(chooseAreaOpen);
            chosenLocationInfoArea.SetActive(!chooseAreaOpen);
            closeButtonHighlighted.SetActive(!chooseAreaOpen);
        }

        LocationDisplayNextLocation GetOrCreateNextLocationDisplay(int i)
        {
            while (nextLocationDisplays.Count <= i)
            {
                nextLocationDisplays.Add(Instantiate(nextLocationDisplayTemplate, nextLocationDisplayTemplate.transform.parent));
            }

            return nextLocationDisplays[i];
        }

        public void Close()
        {
            if (!IsOpen)
                return;

            textToSpeechManager.Stop();

            panel.SetActive(false);

            if (EventClosed != null)
                EventClosed();
        }

        public void PlayDescription()
        {
            textToSpeechManager.Speak(descriptionText.text);
        }

        public void StopPlaying()
        {
            textToSpeechManager.Stop();
        }

        void OnSpeechStarted()
        {
            Debug.Log("+ Speech started");
            UpdateSpeechArea(true);
        }

        void OnSpeechStopped()
        {
            Debug.Log("- Speech stopped");
            UpdateSpeechArea(false);
        }

        void UpdateSpeechArea(bool playing)
        {
            speechButtonPlay.SetActive(!playing);
            speechButtonStop.SetActive(playing);
        }

        void OnSpeechInitialized()
        {
            speechArea.SetActive(true);
        }
    }
}
