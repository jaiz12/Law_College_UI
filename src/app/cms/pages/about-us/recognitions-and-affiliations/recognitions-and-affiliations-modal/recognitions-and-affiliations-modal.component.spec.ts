import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecognitionsAndAffiliationsModalComponent } from './recognitions-and-affiliations-modal.component';

describe('RecognitionsAndAffiliationsModalComponent', () => {
  let component: RecognitionsAndAffiliationsModalComponent;
  let fixture: ComponentFixture<RecognitionsAndAffiliationsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecognitionsAndAffiliationsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecognitionsAndAffiliationsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
