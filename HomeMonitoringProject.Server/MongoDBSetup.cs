using MongoDB.Driver;

namespace HomeMonitoringProject.Server
{
    public class MongoDBSetup
    {
        public static IMongoDatabase InitializeDatabase(string connectionString, string databaseName)
        {
            var client = new MongoClient(connectionString);
            return client.GetDatabase(databaseName);
        }
    }
}
