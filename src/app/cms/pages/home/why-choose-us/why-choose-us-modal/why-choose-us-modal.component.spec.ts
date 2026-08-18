import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyChooseUsModalComponent } from './why-choose-us-modal.component';

describe('WhyChooseUsModalComponent', () => {
  let component: WhyChooseUsModalComponent;
  let fixture: ComponentFixture<WhyChooseUsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhyChooseUsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyChooseUsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
