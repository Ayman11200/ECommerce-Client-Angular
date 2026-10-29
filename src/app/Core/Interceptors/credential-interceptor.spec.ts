import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { credentialInterceptor } from './credential-interceptor';
import { environment } from '../../../environments/environment';

describe('credentialInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => credentialInterceptor(req, next));
  let http: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([interceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('refreshes after a 401 and retries the original request', () => {
    let response: unknown;

    http.get(`${environment.baseUrl}/Order/Get-Orders-for-User`).subscribe((value) => {
      response = value;
    });

    const originalRequest = httpTestingController.expectOne(
      `${environment.baseUrl}/Order/Get-Orders-for-User`,
    );
    expect(originalRequest.request.withCredentials).toBe(true);
    originalRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTestingController.expectOne(
      `${environment.baseUrl}/Account/Refresh-Token`,
    );
    expect(refreshRequest.request.method).toBe('POST');
    expect(refreshRequest.request.withCredentials).toBe(true);
    refreshRequest.flush({});

    const retriedRequest = httpTestingController.expectOne(
      `${environment.baseUrl}/Order/Get-Orders-for-User`,
    );
    retriedRequest.flush([{ id: 1 }]);

    expect(response).toEqual([{ id: 1 }]);
  });

  it('shares one refresh request between concurrent 401 responses', () => {
    const responses: unknown[] = [];

    http.get(`${environment.baseUrl}/Order/first`).subscribe((value) => {
      responses.push(value);
    });
    http.get(`${environment.baseUrl}/Order/second`).subscribe((value) => {
      responses.push(value);
    });

    httpTestingController
      .expectOne(`${environment.baseUrl}/Order/first`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    httpTestingController
      .expectOne(`${environment.baseUrl}/Order/second`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshRequest = httpTestingController.expectOne(
      `${environment.baseUrl}/Account/Refresh-Token`,
    );
    expect(refreshRequest.request.method).toBe('POST');
    refreshRequest.flush({});

    httpTestingController.expectOne(`${environment.baseUrl}/Order/first`).flush('first');
    httpTestingController.expectOne(`${environment.baseUrl}/Order/second`).flush('second');

    expect(responses).toEqual(['first', 'second']);
  });
});
