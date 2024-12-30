using HomeMonitoringProject.Server.Models;
using HomeMonitoringProject.Server.Services;

using Microsoft.AspNetCore.Mvc;

namespace HomeMonitoringProject.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SensorDataController : ControllerBase
    {
        private readonly SensorDataService _service;

        public SensorDataController(SensorDataService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> PostSensorData([FromBody] SensorData data)
        {
            await _service.AddSensorData(data);
            return Ok(new { Message = "Data added successfully" });
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest() =>
            Ok(await _service.GetLatestData());

        [HttpGet("last24hours")]
        public async Task<IActionResult> GetLast24Hours() =>
            Ok(await _service.GetLast24HoursData());

        [HttpGet("stats")]
        public async Task<IActionResult> GetStatistics()
        {
            var data = await _service.GetLast24HoursData();

            if (!data.Any())
                return NotFound("No data available.");

            var temperatures = data.Select(d => d.Temperature).ToList();
            var tempStats = new
            {
                Mean = Math.Round(temperatures.Average(), 2),
                Median = Math.Round(temperatures.OrderBy(x => x).ElementAt(temperatures.Count / 2), 2),
                Mode = Math.Round(temperatures.GroupBy(x => x)
                                               .OrderByDescending(g => g.Count())
                                               .First().Key, 2),
                Range = Math.Round(temperatures.Max() - temperatures.Min(), 2),
                Min = Math.Round(temperatures.Min(), 2),
                Max = Math.Round(temperatures.Max(), 2)
            };

            var humidities = data.Select(d => d.Humidity).ToList();
            var humidityStats = new
            {
                Mean = Math.Round(humidities.Average(), 2),
                Median = Math.Round(humidities.OrderBy(x => x).ElementAt(humidities.Count / 2), 2),
                Mode = Math.Round(humidities.GroupBy(x => x)
                                            .OrderByDescending(g => g.Count())
                                            .First().Key, 2),
                Range = Math.Round(humidities.Max() - humidities.Min(), 2),
                Min = Math.Round(humidities.Min(), 2),
                Max = Math.Round(humidities.Max(), 2)
            };

            var airQualities = data.Select(d => d.AirQuality).ToList();
            var airQualityStats = new
            {
                Mean = Math.Round(airQualities.Average(), 2),
                Median = Math.Round(airQualities.OrderBy(x => x).ElementAt(airQualities.Count / 2), 2),
                Mode = Math.Round(airQualities.GroupBy(x => x)
                                              .OrderByDescending(g => g.Count())
                                              .First().Key, 2),
                Range = Math.Round(airQualities.Max() - airQualities.Min(), 2),
                Min = Math.Round(airQualities.Min(), 2),
                Max = Math.Round(airQualities.Max(), 2)
            };

            return Ok(new
            {
                Temperature = tempStats,
                Humidity = humidityStats,
                AirQuality = airQualityStats
            });

        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearOldData()
        {
            await _service.ClearOldData();
            return Ok(new { Message = "Old data has been cleared" });
        }

        [HttpDelete("clearall")]
        public async Task<IActionResult> ClearAllData()
        {
            await _service.ClearAllData();
            return Ok(new { Message = "All data has been cleared" });
        }

    }
}
