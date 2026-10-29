import { TestBed } from '@angular/core/testing';
import { OrderSrevice } from './order-srevice';

describe('OrderSrevice', () => {
  let service: OrderSrevice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderSrevice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
