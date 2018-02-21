using System;
using UnityEngine;
using UnityUtilities;

namespace UngehoersamReader
{
    /// <summary>
    /// Allows Text to Speech if available, and fails silently if not.
    /// </summary>
    public class TextToSpeechManager : SingletonMonoBehaviour<TextToSpeechManager>
    {
        enum Status
        {
            Uninitialized,
            Initializing,
            Initialized,
            Error,
            Unsupported
        }

        Status status = Status.Uninitialized;

        public bool IsInitialized { get { return status == Status.Initialized; } }
        public bool HadErrorOrIsUnsupported { get { return (status == Status.Error) || (status == Status.Unsupported); } }

        public bool IsSpeaking
        {
            get
            {
#if TTS
                return TTSManager.IsSpeaking();
#else
                return false;
#endif
            }
        }

        public event Action EventInitialized;
        public event Action EventInitializationErrorOrUnsupported;
        public event Action EventSpeechStarted;
        public event Action EventSpeechComplete;

        void Awake()
        {
            if (Application.platform != RuntimePlatform.Android)
            {
                status = Status.Unsupported;
                if (EventInitializationErrorOrUnsupported != null)
                    EventInitializationErrorOrUnsupported();

                return;
            }

#if TTS
            status = Status.Initializing;
            TTSManager.Initialize(transform.name, "OnTTSInit");
#else
            status = Status.Unsupported;
#endif
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();
            status = Status.Uninitialized;
#if TTS       
            TTSManager.Shutdown();
#endif
        }

#if TTS
        void OnTTSInit(string message)
        {
            int response = int.Parse(message);

            switch (response)
            {
                case TTSManager.SUCCESS:
                    if (TTSManager.IsLanguageAvailable(TTSManager.GERMAN))
                    {
                        Debug.Log("[TextToSpeechManager] Initialized and german language set.");
                        TTSManager.SetLanguage(TTSManager.GERMAN);
                        status = Status.Initialized;
                        if (EventInitialized != null)
                            EventInitialized();

                        return;
                    }
                    else
                    {
                        Debug.LogError("[TextToSpeechManager] German lange is not available. Available languages:");
                        foreach (var locale in TTSManager.GetAvailableLanguages())
                        {
                            Debug.LogError(" - " + locale.Language + " / " + locale.Name);
                        }
                    }

                    break;
                case TTSManager.ERROR:
                    Debug.Log("[TextToSpeechManager] Initialization failed.");
                    break;

                default:
                    Debug.Log("[TextToSpeechManager] Initialization failed with unknown response: " + response);
                    break;
            }

            status = Status.Error;
            if (EventInitializationErrorOrUnsupported != null)
                EventInitializationErrorOrUnsupported();
        }

        void OnSpeechCompleted(string id)
        {
            if (EventSpeechComplete != null)
                EventSpeechComplete();
        }
#endif

        public void Speak(string text)
        {
#if TTS
            if (!IsInitialized || (text.Length == 0))
                return;

            TTSManager.Speak(text, false, TTSManager.STREAM.Music, 1f, 0f, transform.name, "OnSpeechCompleted", "");

            if (EventSpeechStarted != null)
                EventSpeechStarted();

            //TTSManager.SetPitch(pitch);
            //TTSManager.SetSpeechRate(speechRate);
#endif
        }

        public void Stop()
        {
#if TTS
            if (!IsInitialized)
                return;

            TTSManager.Stop();

            if (EventSpeechComplete != null)
                EventSpeechComplete();
#endif
        }
    }
}
