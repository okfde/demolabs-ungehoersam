using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading;
using UnityEngine;
using UnityEngine.UI;
using UnityUtilities;
using ZXing;
using ZXing.Common;

namespace UngehoersamReader
{
    /// <summary>
    /// Reads images from the <see cref="WebCam"/> and tries to find a QR code. <see cref="QRCodeResultProcessor"/> subscribes to the <see cref="EventRecognized"/>.
    /// </summary>
    public class QRCodeReader : SingletonMonoBehaviour<QRCodeReader>
    {
        [SerializeField] WebCam webCam;
        [SerializeField] bool tryHarder;
        [SerializeField] bool showDebugOutput;
        [SerializeField] Text debugLastDecodeTimeText;
        [SerializeField] float webGLReadDelay = 0.1f;

        object threadlock = new object();

        BarcodeReader barcodeReader;

        bool quit;

        bool newColorsReady;
        Color32[] colors;
        int width;
        int height;
        int fillColorsFrameCounter = -1;

        Thread thread;
        AutoResetEvent imageRequested;
        AutoResetEvent imageReady;

        Queue<string> messageQueue = new Queue<string>();
        float lastDecodeTime;

        //Queue<string> debugMessageQueue = new Queue<string>();

        Stopwatch stopwatch = new Stopwatch();

        public event Action<string> EventRecognized;

        public bool Reading { get; set; }

        void Awake()
        {
            barcodeReader = new BarcodeReader(new ZXing.QrCode.QRCodeReader(), CreateLuminanceSource, CreateBinarizer)
            {
                AutoRotate = false,
                TryInverted = false,
                Options = new DecodingOptions()
                {
                    PossibleFormats = new List<BarcodeFormat>(1)
                    {
                        BarcodeFormat.QR_CODE
                    },
                    TryHarder = tryHarder
                }
            };

            quit = false;

            imageRequested = new AutoResetEvent(true);
            imageReady = new AutoResetEvent(false);

            try
            {
                thread = new Thread(DecodeThread);
                thread.Start();
            }
            catch (SystemException exception)
            {
                thread = null;
                UnityEngine.Debug.Log("[QRCodeReader] Couldn't start thread (probably because the platform doesn't support it); falling back to coroutine. " +
                                      "This is expected on WebGL. Exception was: " + exception.Message);
                // We're probably on a platform that doesn't support threads.
                StartCoroutine(DecodeCoroutine());
            }
        }

        static LuminanceSource CreateLuminanceSource(Color32[] colors, int width, int height)
        {
            LuminanceSource luminanceSource = new Color32LuminanceSource(colors, width, height);
            if (luminanceSource.CropSupported)
            {
                var smallerSize = Mathf.Min(width, height);
                var smallerSizeHalf = smallerSize / 2;
                luminanceSource = luminanceSource.crop(width / 2 - smallerSizeHalf, height / 2 - smallerSizeHalf, smallerSize, smallerSize);
            }

            return luminanceSource;
        }

        static Binarizer CreateBinarizer(LuminanceSource luminanceSource)
        {
            return new HybridBinarizer(luminanceSource);
        }

        protected override void OnDestroy()
        {
            base.OnDestroy();

            StopAllCoroutines();

            quit = true;
            
            if (thread != null)
            {
                thread.Abort();
                thread.Join(1000);
            }
        }

        void Update()
        {
            if (!webCam.CameraSource.Ready)
                return;

            if (Reading && imageRequested.WaitOne(0))
            {
                if (webCam.CameraSource.FillColors(ref colors, ref width, ref height, ref fillColorsFrameCounter))
                {
                    //lock (debugMessageQueue) debugMessageQueue.Enqueue("Image is ready");
                    imageReady.Set();
                }
                else
                {
                    //lock (debugMessageQueue) debugMessageQueue.Enqueue("FillColors failed; requesting image again");
                    imageRequested.Set();
                }
            }

            lock (threadlock)
            {
                if (messageQueue.Count > 0)
                {
                    if (!Reading)
                    {
                        messageQueue.Clear();
                    }

                    while (messageQueue.Count > 0)
                    {
                        var message = messageQueue.Dequeue();
                        if (EventRecognized != null)
                            EventRecognized(message);
                    }
                }
            }

            /*
            lock (debugMessageQueue)
            {
                while (debugMessageQueue.Count > 0)
                {
                    Debug.Log(debugMessageQueue.Dequeue());
                }
            }
            */

            if (showDebugOutput)
            {
                debugLastDecodeTimeText.text = ((int) lastDecodeTime).ToString();
            }
        }

        void DecodeThread()
        {
            while (!quit)
            {
                while (!Reading)
                {
                    PrepareNextReading();
                    Thread.Sleep(10);
                }

                if (imageReady.WaitOne(5))
                {
                    DecodeStep();
                }
            }
        }

        IEnumerator DecodeCoroutine()
        {
            while (!quit)
            {
                while (!Reading)
                {
                    PrepareNextReading();
                    yield return new WaitForSeconds(webGLReadDelay);
                }

                if (imageReady.WaitOne(0))
                {
                    DecodeStep();
                }
                
                yield return new WaitForSeconds(webGLReadDelay);
            }

            yield break;
        }
        
        void PrepareNextReading()
        {
            //lock (debugMessageQueue) debugMessageQueue.Enqueue("Not reading; waiting");

            imageReady.Reset();
            imageRequested.Set();
        }

        void DecodeStep()
        {
            //lock (debugMessageQueue) debugMessageQueue.Enqueue("Decoding...");

            if (showDebugOutput)
            {
                stopwatch.Start();
            }

            var result = barcodeReader.Decode(colors, width, height);

            if (showDebugOutput)
            {
                stopwatch.Stop();
                lastDecodeTime = stopwatch.ElapsedMilliseconds;
                stopwatch.Reset();
            }

            if (result != null)
            {
                //lock (debugMessageQueue) debugMessageQueue.Enqueue("Found a QR code; requesting new image");

                lock (threadlock)
                {
                    messageQueue.Enqueue(result.Text);
                }
            }
            /*
            else
            {
                lock (debugMessageQueue) debugMessageQueue.Enqueue("Couldn't find a QR code; requesting new image");
            }
            */

            imageRequested.Set();
        }
    }
}
