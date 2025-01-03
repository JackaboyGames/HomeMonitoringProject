import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent; // Instance of the component under test
  let fixture: ComponentFixture<AppComponent>; // Fixture to interact with the component
  let httpMock: HttpTestingController; // Mock HTTP service for intercepting API calls

  beforeEach(async () => {
    // Configure the testing module for the component
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [HttpClientTestingModule]  // Import HttpClient testing module
    }).compileComponents();
  });

  beforeEach(() => {
    // Initialise the component and inject dependencies
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifies that there are no remaining HTTP requests
    httpMock.verify();
  });

  it('should create the app', () => {
    // Test to ensure the component is created successfully
    expect(component).toBeTruthy();
  });

  it('should fetch latest data and update latestData property', () => {
    // Mock data for the latest sensor reading
    const mockSensorData = {
      dateTime: '2024-12-12T12:00:00Z',
      temperature: 22,
      humidity: 50,
      airQuality: 320,
    };
    
    // Calls the method to fetch the latest data
    component.fetchLatestData();

    // Expect a GET request to the specific API endpoint
    const req = httpMock.expectOne('/api/sensordata/latest');
    expect(req.request.method).toBe('GET');

    // Respond with the mock data
    req.flush(mockSensorData);

    // Check that the component's latestData property is correctly updated
    expect(component.latestData).toEqual(mockSensorData);
  });


  it('should fetch last 24 hours data and update charts', () => {
    // Mock data for the last 24 hours
    const mockSensorData = [
      {
        dateTime: '2024-12-01T10:00:00Z',
        temperature: 22,
        humidity: 45,
        airQuality: 200,
      },
      {
        dateTime: '2024-12-01T11:00:00Z',
        temperature: 23,
        humidity: 47,
        airQuality: 210,
      },
    ];

    // Initialise charts before updating them
    component.initialiseCharts();

    // Spies to make sure chart update methods are called
    const temperatureChartUpdateSpy = spyOn(component.temperatureChart!, 'update').and.callThrough();
    const humidityChartUpdateSpy = spyOn(component.humidityChart!, 'update').and.callThrough();
    const airQualityChartUpdateSpy = spyOn(component.airQualityChart!, 'update').and.callThrough();

    // Call the method to fetch the last 24 hours data
    component.fetchLast24Hours();

    // Expect a GET request to the specific API endpoint
    const req = httpMock.expectOne('/api/sensordata/last24hours');
    expect(req.request.method).toBe('GET');

    // Respond with the mock data
    req.flush(mockSensorData);

    // Check that the component's sensorDataList property is correctly updated
    expect(component.sensorDataList).toEqual(mockSensorData);

    // Check that the chart data and labels are updated
    expect(component.temperatureChart!.data.labels).toEqual([
      '2024-12-01T10:00:00Z',
      '2024-12-01T11:00:00Z',
    ]);

    expect(component.temperatureChart!.data.datasets[0].data).toEqual([22, 23]);

    expect(component.humidityChart!.data.labels).toEqual([
      '2024-12-01T10:00:00Z',
      '2024-12-01T11:00:00Z',
    ]);
    expect(component.humidityChart!.data.datasets[0].data).toEqual([45, 47]);

    expect(component.airQualityChart!.data.labels).toEqual([
      '2024-12-01T10:00:00Z',
      '2024-12-01T11:00:00Z',
    ]);
    expect(component.airQualityChart!.data.datasets[0].data).toEqual([200, 210]);

    // Check that the chart update methods were called
    expect(temperatureChartUpdateSpy).toHaveBeenCalledWith('none');
    expect(humidityChartUpdateSpy).toHaveBeenCalledWith('none');
    expect(airQualityChartUpdateSpy).toHaveBeenCalledWith('none');
  });

  it('should fetch statistics and update the statistics property', () => {
    // Mock data for statistics
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

    // Call the method to fetch statistics
    component.fetchStats();

    // Expect a GET request to the specific API endpoint
    const req = httpMock.expectOne('/api/sensordata/stats');
    expect(req.request.method).toBe('GET');

    // Respond with the mock data
    req.flush(mockStats);

    // Check that the component's statistics property is correctly updated
    expect(component.statistics).toEqual(mockStats);
  });

  it('should clear all data and refresh data', () => {
    // Spies to make sure refresh methods are called
    spyOn(component, 'fetchLatestData').and.callThrough();
    spyOn(component, 'fetchLast24Hours').and.callThrough();
    spyOn(component, 'fetchStats').and.callThrough();

    // Call the method to clear all data
    component.clearAllData();

    // Expect a DELETE request to the specific API endpoint
    const deleteReq = httpMock.expectOne('/api/sensordata/clearall');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush({});

    // Expect GET requests to refresh the data
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

    // Check that the refresh methods were called
    expect(component.fetchLatestData).toHaveBeenCalled();
    expect(component.fetchLast24Hours).toHaveBeenCalled();
    expect(component.fetchStats).toHaveBeenCalled();
  });

});
