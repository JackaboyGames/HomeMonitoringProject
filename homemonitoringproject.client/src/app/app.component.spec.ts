import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch latest data and update latestData property', () => {
    const mockSensorData = {
      dateTime: '2024-01-01T12:00:00Z',
      temperature: 25,
      humidity: 50,
      airQuality: 300,
    };

    component.fetchLatestData();
    const req = httpMock.expectOne('/api/sensordata/latest');
    expect(req.request.method).toBe('GET');
    req.flush(mockSensorData);

    expect(component.latestData).toEqual(mockSensorData);
  });


  it('should fetch last 24 hours data and update charts', () => {
    const mockSensorData = [
      {
        dateTime: '2024-01-01T11:00:00Z',
        temperature: 22,
        humidity: 45,
        airQuality: 200,
      },
      {
        dateTime: '2024-01-01T12:00:00Z',
        temperature: 23,
        humidity: 47,
        airQuality: 210,
      },
    ];

    component.fetchLast24Hours();
    const req = httpMock.expectOne('/api/sensordata/last24hours');
    expect(req.request.method).toBe('GET');
    req.flush(mockSensorData);

    expect(component.sensorDataList).toEqual(mockSensorData);
    expect(component.temperatureChartData.labels).toEqual([
      '2024-01-01T11:00:00Z',
      '2024-01-01T12:00:00Z',
    ]);
    expect(component.temperatureChartData.datasets[0].data).toEqual([22, 23]);
    expect(component.humidityChartData.datasets[0].data).toEqual([45, 47]);
    expect(component.airQualityChartData.datasets[0].data).toEqual([200, 210]);
  });

  it('should fetch statistics and update the statistics property', () => {
    const mockStats = {
      temperature: {
        mean: 22.5,
        median: 22.5,
        mode: 22,
        range: 1,
        min: 22,
        max: 23,
      },
      humidity: {
        mean: 46,
        median: 46,
        mode: 45,
        range: 2,
        min: 45,
        max: 47,
      },
      airQuality: {
        mean: 205,
        median: 205,
        mode: 200,
        range: 10,
        min: 200,
        max: 210,
      },
    };

    component.fetchStats();
    const req = httpMock.expectOne('/api/sensordata/stats');
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);

    expect(component.statistics).toEqual(mockStats);
  });

  it('should clear all data and refresh data', () => {
    spyOn(component, 'fetchLatestData').and.callThrough();
    spyOn(component, 'fetchLast24Hours').and.callThrough();
    spyOn(component, 'fetchStats').and.callThrough();

    component.clearAllData();

    const deleteReq = httpMock.expectOne('/api/sensordata/clearall');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    const refreshLatestReq = httpMock.expectOne('/api/sensordata/latest');
    expect(refreshLatestReq.request.method).toBe('GET');
    refreshLatestReq.flush({ dateTime: '', temperature: 0, humidity: 0, airQuality: 0 });

    const refreshLast24HoursReq = httpMock.expectOne('/api/sensordata/last24hours');
    expect(refreshLast24HoursReq.request.method).toBe('GET');
    refreshLast24HoursReq.flush([]);

    const refreshStatsReq = httpMock.expectOne('/api/sensordata/stats');
    expect(refreshStatsReq.request.method).toBe('GET');
    refreshStatsReq.flush({
      temperature: { mean: 0, median: 0, mode: 0, range: 0, min: 0, max: 0 },
      humidity: { mean: 0, median: 0, mode: 0, range: 0, min: 0, max: 0 },
      airQuality: { mean: 0, median: 0, mode: 0, range: 0, min: 0, max: 0 },
    });

    expect(component.fetchLatestData).toHaveBeenCalled();
    expect(component.fetchLast24Hours).toHaveBeenCalled();
    expect(component.fetchStats).toHaveBeenCalled();
  });

});
