import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NationalSocialServiceComponent } from './national-social-service.component';

describe('NationalSocialServiceComponent', () => {
  let component: NationalSocialServiceComponent;
  let fixture: ComponentFixture<NationalSocialServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NationalSocialServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NationalSocialServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
