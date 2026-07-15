import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateEditRoleModalComponent } from './create-edit-role-modal/create-edit-role-modal.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CmsApiService } from '../../../../services/cms-api-service.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

interface Role {
  id: number;
  roleName: string;
  description: string;
  users: number;
  createdBy: string;
  createdOn: string;
}

@Component({
  selector: 'app-role-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateEditRoleModalComponent, NgxPaginationModule],
  templateUrl: './role-manager.component.html',
  styleUrl: './role-manager.component.scss'
})
export class RoleManagerComponent {

  constructor(private apiService: CmsApiService, private toastr: ToastrService) {
    this.getRoles();
  }

  search = signal('');

  page = signal(1);
  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  showModal = signal(false);

  selectedRole = signal<Role | null>(null);

  roles = signal<Role[]>([]);

  filteredRoles = computed(() => {

    const keyword = this.search().trim().toLowerCase();

    if (!keyword) {
      return this.roles();
    }

    return this.roles().filter(role =>
      role.roleName.toLowerCase().includes(keyword) ||
      role.users.toString().includes(keyword) ||
      (role.users > 0 ? 'assigned' : 'not assigned')
        .includes(keyword)
    );

  });



  createRole() {

    this.selectedRole.set(null);

    this.showModal.set(true);

  }

  edit(role: Role) {

    this.selectedRole.set(role);

    this.showModal.set(true);

  }

  closeModal() {

    this.showModal.set(false);

    this.selectedRole.set(null);

  }



  getRoles() {
    this.apiService.GetRequest("RoleManagment/GetRoles").subscribe((res: any[]) => {
      console.log(res)
      this.roles.set(res);
    });
  }


  saveRole(role: any) {
    console.log(role);


    const model = {
      id: role.Id,
      name: role.Name
    };

    const apiCall = role.Id
      ? this.apiService.PutRequest('RoleManagment/EditRole', model)
      : this.apiService.PostRequest('RoleManagment/CreateRole', model);

    apiCall.subscribe({

      next: (res: any) => {

        console.log(res);


        if (res.messageType === "success") {

          // show toast
          this.toastr.success(
            res.message,
            'Success'
          );

          this.getRoles(); // reload role list

          this.closeModal();

        }
        else {

          this.toastr.warning(
            res.message,
            'Warning'
          );

        }

      },


      error: (err: any) => {

        this.toastr.error(
          err?.error?.message ||
          err?.message ||
          'Something went wrong. Please try again.',
          'Error'
        );

      }

    });


    this.showModal.set(false);

  }



  delete(role: Role) {

    Swal.fire({
      title: 'Delete Role?',
      text: `Are you sure you want to delete "${role.roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true
    }).then((result) => {

      if (result.isConfirmed) {

        this.apiService.DeleteRequest(`RoleManagment/DeleteRole`, role.id)
          .subscribe({

            next: (res: any) => {

              if (res.messageType === 'success') {

                this.toastr.success(res.message, 'Success');

                this.getRoles();

              } else {

                this.toastr.warning(res.message, 'Warning');

              }

            },

            error: (err: any) => {

              this.toastr.error(
                err?.error?.message ||
                'Unable to delete role.',
                'Error'
              );

            }

          });

      }

    });

  }


  deleteMessage(role: Role) {
    Swal.fire({
      title: 'Delete Role?',
      text: `You can't delete "${role.roleName}" because it has been assigned to one or more users.`,
      icon: 'warning',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626'
    });

  }


}
