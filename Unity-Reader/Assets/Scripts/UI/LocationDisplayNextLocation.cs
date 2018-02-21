using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An entry in the list of potential next locations for <see cref="LocationDisplay"/>.
    /// </summary>
    public class LocationDisplayNextLocation : MonoBehaviour
    {
        [SerializeField] Text textDisplay;
        [SerializeField] Button button;
        [SerializeField] GameObject dashedLine;

        NextLocation nextLocation;

        void Awake()
        {
            button.onClick.AddListener(OnButtonClicked);
        }

        public void Set(NextLocation nextLocation, bool last)
        {
            this.nextLocation = nextLocation;
            textDisplay.text = nextLocation.Decision;
            dashedLine.gameObject.SetActive(!last);
        }

        void OnButtonClicked()
        {
            LocationDisplay.Instance.ShowNextLocationInfo(nextLocation);
        }
    }
}
