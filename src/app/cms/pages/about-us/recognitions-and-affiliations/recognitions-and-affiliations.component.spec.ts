import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecognitionsAndAffiliationsComponent } from './recognitions-and-affiliations.component';

describe('RecognitionsAndAffiliationsComponent', () => {
  let component: RecognitionsAndAffiliationsComponent;
  let fixture: ComponentFixture<RecognitionsAndAffiliationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecognitionsAndAffiliationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecognitionsAndAffiliationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
