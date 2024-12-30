using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HomeMonitoringProject.Server.Models
{
    public class SensorData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double AirQuality { get; set; }
        public DateTime DateTime { get; set; }
    }
}
