import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

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

  private pollingSubscription: Subscription | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats();

    this.pollingSubscription = interval(2000).subscribe(() => {
      this.fetchLatestData();
    });
  }

  ngOnDestroy() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
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

  refreshData() {
    this.fetchLatestData();
    this.fetchLast24Hours();
    this.fetchStats(); 
  }

  postFudgeData() {
    const fudgeData: SensorData = {
      dateTime: new Date().toISOString(),
      temperature: parseFloat((Math.random() * 10 + 20).toFixed(2)),
      humidity: parseFloat((Math.random() * 50 + 30).toFixed(2)),
      airQuality: parseFloat((Math.random() * 100).toFixed(2)),
    };

    this.http.post('/api/sensordata', fudgeData).subscribe(
      () => {
        console.log('Fudge data posted successfully.');
        this.fetchLatestData(); 
        this.fetchLast24Hours(); 
        this.fetchStats(); 
      },
      (error) => {
        console.error('Error posting fudge data:', error);
      }
    );
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
