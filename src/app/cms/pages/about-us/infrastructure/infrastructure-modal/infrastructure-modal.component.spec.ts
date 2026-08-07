import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfrastructureModalComponent } from './infrastructure-modal.component';

describe('InfrastructureModalComponent', () => {
  let component: InfrastructureModalComponent;
  let fixture: ComponentFixture<InfrastructureModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfrastructureModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfrastructureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
