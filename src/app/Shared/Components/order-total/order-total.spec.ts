import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderTotal } from './order-total';

describe('OrderTotal', () => {
  let component: OrderTotal;
  let fixture: ComponentFixture<OrderTotal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderTotal],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderTotal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
