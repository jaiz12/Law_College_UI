import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaModalComponent } from './media-modal.component';

describe('MediaModalComponent', () => {
  let component: MediaModalComponent;
  let fixture: ComponentFixture<MediaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
