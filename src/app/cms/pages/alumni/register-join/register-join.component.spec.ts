import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterJoinComponent } from './register-join.component';

describe('RegisterJoinComponent', () => {
  let component: RegisterJoinComponent;
  let fixture: ComponentFixture<RegisterJoinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterJoinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
