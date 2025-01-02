import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { ChartConfiguration, ChartData, registerables, Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

type StatsKey = 'temperature' | 'humidity' | 'airQuality';

interface SensorData {
  dateTime: string; 
  temperature: number;
  humidity: number;
  airQuality: number;
}

interface StatsDetails {
  mean: number;
  median: number;
  mode: number;
  range: number;
  min: number;
  max: number;
}

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
  public latestData: SensorData | null = null;
  public sensorDataList: SensorData[] = [];
  public statistics: Stats | null = null;
  public statsKeys: StatsKey[] = ['temperature', 'humidity', 'airQuality'];

  public temperatureChart?: Chart;
  public humidityChart?: Chart;
  public airQualityChart?: Chart;

  private pollingSubscription: Subscription | null = null;

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

  public chartOptions: ChartConfiguration['options'] = {
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
  };

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.initialiseCharts();
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats();

    this.pollingSubscription = interval(2000).subscribe(() => {
      this.fetchLatestData();
    });

    interval(60000).subscribe(() => {
      this.fetchLast24Hours();
      this.fetchStats(); 
    });
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  initialiseCharts() {
    const temperatureCanvas = document.getElementById('temperatureChart') as HTMLCanvasElement;
    const humidityCanvas = document.getElementById('humidityChart') as HTMLCanvasElement;
    const airQualityCanvas = document.getElementById('airQualityChart') as HTMLCanvasElement;

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

  fetchLast24Hours() {
    this.http.get<SensorData[]>('/api/sensordata/last24hours').subscribe(
      (result) => {
        this.sensorDataList = result;

        const temperatureData: number[] = [];
        const humidityData: number[] = [];
        const airQualityData: number[] = [];
        const labels: string[] = [];

        result.forEach((data) => {
          temperatureData.push(data.temperature);
          humidityData.push(data.humidity);
          airQualityData.push(data.airQuality);
          labels.push(data.dateTime);
        });

        if (this.temperatureChart) {
          this.temperatureChart.data.labels = labels;
          this.temperatureChart.data.datasets[0].data = temperatureData;
          this.temperatureChart.update('none');
        }

        if (this.humidityChart) {
          this.humidityChart.data.labels = labels;
          this.humidityChart.data.datasets[0].data = humidityData;
          this.humidityChart.update('none');
        }

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

  getStatisticValue(key: StatsKey, field: keyof StatsDetails): number | undefined {
    if (this.statistics) {
      return this.statistics[key]?.[field];
    }
    return undefined;
  }

  refreshData() {
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats(); 
  }

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
