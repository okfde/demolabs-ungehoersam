using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An interface to unify the different possible camera sources.
    /// </summary>
    public interface ICameraSource
    {
        void Update();

        bool Ready { get; }
        bool IsPlaying { get; }
        
        Texture Texture { get; }
        bool FillColors(ref Color32[] colors, ref int width, ref int height, ref int lastFillColorsFrame);
        void RefreshView(RectTransform rectTransform, RawImage rawImage, AspectRatioFitter aspectRatioFitter, ref object refreshTracker);
        
        int FrameCounter { get; }

        void SetActive(bool active);
    }
}
