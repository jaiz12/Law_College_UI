import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditRoleModalComponent } from './create-edit-role-modal.component';

describe('CreateEditRoleModalComponent', () => {
  let component: CreateEditRoleModalComponent;
  let fixture: ComponentFixture<CreateEditRoleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditRoleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEditRoleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
