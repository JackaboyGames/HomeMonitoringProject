using HomeMonitoringProject.Server.Models;
using MongoDB.Bson;
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

        public async Task<List<SensorData>> GetLast24HoursData()
        {
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("DateTime", new BsonDocument("$gte", DateTime.UtcNow.AddHours(-24)))),

                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument
                        {
                            { "year", new BsonDocument("$year", "$DateTime") },
                            { "month", new BsonDocument("$month", "$DateTime") },
                            { "day", new BsonDocument("$dayOfMonth", "$DateTime") },
                            { "hour", new BsonDocument("$hour", "$DateTime") },
                            { "minute", new BsonDocument("$minute", "$DateTime") },
                        }
                    },
                    { "Document", new BsonDocument("$first", "$$ROOT") }
                }),

                new BsonDocument("$replaceRoot", new BsonDocument("newRoot", "$Document")),

                new BsonDocument("$sort", new BsonDocument("DateTime", 1))
            };

            var result = await _collection.Aggregate<SensorData>(pipeline).ToListAsync();
            return result;
        }

        public async Task ClearOldData() =>
            await _collection.DeleteManyAsync(d => d.DateTime < DateTime.UtcNow.AddHours(-24));

        public async Task ClearAllData() =>
            await _collection.DeleteManyAsync(_ => true);
    }
}
