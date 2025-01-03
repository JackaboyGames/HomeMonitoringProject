import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ChartConfiguration, ChartData, registerables, Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Keys for sensor statistics
type StatsKey = 'temperature' | 'humidity' | 'airQuality';

// Interface for a single sensor data record
interface SensorData {
  dateTime: string; 
  temperature: number;
  humidity: number;
  airQuality: number;
}

// Interface for statistics of a single sensor
interface StatsDetails {
  mean: number;
  median: number;
  mode: number;
  range: number;
  min: number;
  max: number;
}

// Interface for statistics of all sensor types

interface Stats {
  temperature: StatsDetails;
  humidity: StatsDetails;
  airQuality: StatsDetails;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  // Latest sensor data
  public latestData: SensorData | null = null;

  // Array of sensor data for the last 24 hours
  public sensorDataList: SensorData[] = [];

  // Sensor statistics
  public statistics: Stats | null = null;

  // Keys for different sensor types
  public statsKeys: StatsKey[] = ['temperature', 'humidity', 'airQuality'];

  // Chart objects for each sensor type
  public temperatureChart?: Chart;
  public humidityChart?: Chart;
  public airQualityChart?: Chart;

  // Polling subscription for data updates
  private pollingSubscription: Subscription | null = null;

  // Data configuration for the temperature chart
  public temperatureChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Temperature (°C)',
        borderColor: 'red',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'red',
        pointRadius: 1,
        fill: false,
      },
    ],
  };

  // Data configuration for the humidity chart
  public humidityChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [], 
        label: 'Humidity (%)',
        borderColor: 'blue',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'blue',
        pointRadius: 1,
        fill: false,
      },
    ],
  };

  // Data configuration for the air quality chart
  public airQualityChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Air Quality',
        borderColor: 'green',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'green',
        pointRadius: 1,
        fill: false,
      },
    ],
  };

  // Chart options shared between all charts
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top', // Places the legend at the top
      },
    },
    scales: {
      x: {
        type: 'time', // X-axis is time-based
        time: {
          unit: 'hour',
          tooltipFormat: 'HH:mm:ss',
          displayFormats: {
            hour: 'HH:mm',
          },
        },
      },
      y: {
        beginAtZero: true, // Y-axis starts at 0
      },
    },
  };

  // Inject HttpClient and register the Chart.js components
  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.initialiseCharts();
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats();

    // Poll latest data every 2 seconds
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.fetchLatestData();
    });

    // Fetch full data and stats every minute
    interval(60000).subscribe(() => {
      this.fetchLast24Hours();
      this.fetchStats(); 
    });
  }

  // Lifecycle hook for cleanup when the component is destroyed
  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  // Initialise the chart instances with data and configuration
  initialiseCharts() {
    const temperatureCanvas = document.getElementById('temperatureChart') as HTMLCanvasElement;
    const humidityCanvas = document.getElementById('humidityChart') as HTMLCanvasElement;
    const airQualityCanvas = document.getElementById('airQualityChart') as HTMLCanvasElement;

    // Create and configure temperature chart if canvas is available
    if (temperatureCanvas) {
      this.temperatureChart = new Chart(temperatureCanvas, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Temperature (°C)',
              data: [],
              borderColor: 'red',
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: 'red',
              pointRadius: 1,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'HH:mm:ss',
                displayFormats: {
                  hour: 'HH:mm',
                },
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Create and configure humidity chart if canvas is available
    if (humidityCanvas) {
      this.humidityChart = new Chart(humidityCanvas, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Humidity (%)',
              data: [],
              borderColor: 'blue',
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: 'blue',
              pointRadius: 1,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'HH:mm:ss',
                displayFormats: {
                  hour: 'HH:mm',
                },
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    // Create and configure air quality chart if canvas is available
    if (airQualityCanvas) {
      this.airQualityChart = new Chart(airQualityCanvas, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Air Quality',
              data: [],
              borderColor: 'green',
              borderWidth: 2,
              tension: 0.4,
              pointBackgroundColor: 'green',
              pointRadius: 1,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'hour',
                tooltipFormat: 'HH:mm:ss',
                displayFormats: {
                  hour: 'HH:mm',
                },
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },

        });
    }
  }

  // Fetch the most recent sensor data from the API
  fetchLatestData() {
    this.http.get<SensorData>('/api/sensordata/latest').subscribe(
      (result) => {
        this.latestData = result;
      },
      (error) => {
        console.error('Error fetching latest data:', error);
      }
    );
  }

  // Fetch sensor data for the last 24 hours from the API
  fetchLast24Hours() {
    this.http.get<SensorData[]>('/api/sensordata/last24hours').subscribe(
      (result) => {
        this.sensorDataList = result;

        const temperatureData: number[] = [];
        const humidityData: number[] = [];
        const airQualityData: number[] = [];
        const labels: string[] = [];

        // Populate the chart data and labels from API response
        result.forEach((data) => {
          temperatureData.push(data.temperature);
          humidityData.push(data.humidity);
          airQualityData.push(data.airQuality);
          labels.push(data.dateTime);
        });

        // Update temperature chart data
        if (this.temperatureChart) {
          this.temperatureChart.data.labels = labels;
          this.temperatureChart.data.datasets[0].data = temperatureData;
          this.temperatureChart.update('none');
        }

        // Update humidity chart data
        if (this.humidityChart) {
          this.humidityChart.data.labels = labels;
          this.humidityChart.data.datasets[0].data = humidityData;
          this.humidityChart.update('none');
        }

        // Update air quality chart data
        if (this.airQualityChart) {
          this.airQualityChart.data.labels = labels;
          this.airQualityChart.data.datasets[0].data = airQualityData;
          this.airQualityChart.update('none');
        }
      },
      (error) => {
        console.error('Error fetching last 24 hours data:', error);
      }
    );
  }

  // Fetch statistics for sensor data from the API
  fetchStats() {
    this.http.get<Stats>('/api/sensordata/stats').subscribe(
      (result) => {
        this.statistics = result;
      },
      (error) => {
        console.error('Error fetching stats:', error);
      }
    );
  }

  // Get a specific statistic value for a sensor type
  getStatisticValue(key: StatsKey, field: keyof StatsDetails): number | undefined {
    if (this.statistics) {
      return this.statistics[key]?.[field];
    }
    return undefined;
  }

  // Refresh all data using relevant API calls
  refreshData() {
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats(); 
  }

  // Clear all sensor data by making a DELETE request to the API
  clearAllData() {
    this.http.delete('/api/sensordata/clearall').subscribe(
      () => {
        console.log('All data cleared successfully.');
        this.fetchLatestData();
        this.fetchLast24Hours(); 
        this.fetchStats(); 
      },
      (error) => {
        console.error('Error clearing all data:', error);
      }
    );
  }

  title = 'homemonitoringproject.client';
}
