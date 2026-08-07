import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsEventsArchivesComponent } from './news-events-archives.component';

describe('NewsEventsArchivesComponent', () => {
  let component: NewsEventsArchivesComponent;
  let fixture: ComponentFixture<NewsEventsArchivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsEventsArchivesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsEventsArchivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
