namespace UngehoersamReader
{
    /// <summary>
    /// A choice for a next location inside a <see cref="Location"/>.
    /// </summary>
    public class NextLocation
    {
        public string Decision { get; private set; }
        public string LocationName { get; private set; }

        public NextLocation(string decision, string locationName)
        {
            Decision = decision;
            LocationName = locationName;
        }
    }
}
