using UnityEngine;
using UnityEngine.UI;

namespace UngehoersamReader
{
    /// <summary>
    /// An entry in the <see cref="History"/> display.
    /// </summary>
    public class HistoryLocationButton : MonoBehaviour
    {
        [SerializeField] Text textScanTime;
        [SerializeField] Text textSceneName;

        History history;
        Location location;

        void Awake()
        {
            history = History.Instance;
        }

        public void Set(Location location)
        {
            this.location = location;

            if (location == null)
            {
                gameObject.SetActive(false);
                return;
            }

            gameObject.SetActive(true);

            textScanTime.text = location.ScanDateTime.ToString("HH:mm");
            textSceneName.text = location.SceneName;
        }

        public void OpenLocation()
        {
            history.OpenLocation(location);
        }
    }
}
