import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewslettersModalComponent } from './newsletters-modal.component';

describe('NewslettersModalComponent', () => {
  let component: NewslettersModalComponent;
  let fixture: ComponentFixture<NewslettersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewslettersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewslettersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
