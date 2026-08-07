import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NirfIqacComponent } from './nirf-iqac.component';

describe('NirfIqacComponent', () => {
  let component: NirfIqacComponent;
  let fixture: ComponentFixture<NirfIqacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NirfIqacComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NirfIqacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
