using HomeMonitoringProject.Server.Models;
using MongoDB.Driver;

namespace HomeMonitoringProject.Server.Services
{
    public class SensorDataService
    {
        private readonly IMongoCollection<SensorData> _collection;

        public SensorDataService(IMongoDatabase database)
        {
            _collection = database.GetCollection<SensorData>("SensorData");
        }

        public async Task AddSensorData(SensorData data) =>
            await _collection.InsertOneAsync(data);

        public async Task<SensorData> GetLatestData() =>
            await _collection.Find(_ => true).SortByDescending(d => d.DateTime).FirstOrDefaultAsync();

        public async Task<List<SensorData>> GetLast24HoursData() =>
            await _collection.Find(d => d.DateTime >= DateTime.UtcNow.AddHours(-24)).ToListAsync();

        public async Task ClearOldData() =>
            await _collection.DeleteManyAsync(d => d.DateTime < DateTime.UtcNow.AddHours(-24));

        public async Task ClearAllData() =>
            await _collection.DeleteManyAsync(_ => true);
    }
}
