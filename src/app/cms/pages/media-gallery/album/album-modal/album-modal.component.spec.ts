import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlbumModalComponent } from './album-modal.component';

describe('AlbumModalComponent', () => {
  let component: AlbumModalComponent;
  let fixture: ComponentFixture<AlbumModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlbumModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlbumModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
