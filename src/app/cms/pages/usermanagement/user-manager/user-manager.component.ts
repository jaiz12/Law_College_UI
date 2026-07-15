import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

import { CmsApiService } from '../../../../services/cms-api-service.service';
import { CreateEditUserModalComponent } from './create-edit-user-modal/create-edit-user-modal.component';

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string | null;
  userName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  roleId: string | null;
  roleName?: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-user-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    CreateEditUserModalComponent
  ],
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.scss'
})
export class UserManagerComponent implements OnInit {

  constructor(
    private apiService: CmsApiService,
    private toastr: ToastrService
  ) {
   
  }

  //-------------------------------------
  // Signals
  //-------------------------------------

  loggedInId = signal('')

  search = signal('');

  page = signal(1);

  itemsPerPage = signal(5);

  pageSizeOptions = [5, 10, 20, 50];

  showModal = signal(false);

  selectedUser = signal<User | null>(null);

  users = signal<User[]>([]);

  roles = signal<Role[]>([]);


  ngOnInit() {
    this.getRoles();
    this.getUsers();

    const userString = localStorage.getItem('user');

    if (userString) {
      const currentUser = JSON.parse(userString);
      this.loggedInId.set(currentUser.id);
    }
  }

  

  //-------------------------------------
  // Filter Users
  //-------------------------------------

  filteredUsers = computed(() => {

    const keyword = this.search().trim().toLowerCase();

    if (!keyword) {
      return this.users();
    }

    return this.users().filter(user =>

      user.userName.toLowerCase().includes(keyword) ||

      user.email.toLowerCase().includes(keyword) ||

      user.phoneNumber.toLowerCase().includes(keyword) ||

      (user.roleName ?? '').toLowerCase().includes(keyword)

    );

  });

  //-------------------------------------
  // Get Roles
  //-------------------------------------

  getRoles() {

    this.apiService
      .GetRequest('RoleManagment/GetRoles')
      .subscribe({

        next: (res: any[]) => {

          const roles = res.map(x => ({

            id: String(x.id ?? x.Id),
            name: x.name ?? x.roleName

          }));

          this.roles.set(roles);
          console.log(this.roles(), res)

        },

        error: (err) => {

          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Something went wrong. Please try again.',
            'Error'
          );

        }

      });

  }

  //-------------------------------------
  // Get Users
  //-------------------------------------

  getUsers() {

    this.apiService
      .GetRequest('UserManagement/GetUsers')
      .subscribe({

        next: (res: any) => {

          const users = res.data.map((x: any) => ({

            id: String(x.id ?? x.Id),

            userName: x.userName ?? x.UserName,

            email: x.email ?? x.Email,

            phoneNumber: x.phoneNumber ?? x.PhoneNumber,

            password: '',

            roleId: String(x.roleId ?? x.RoleId),

            roleName: x.roleName ?? x.RoleName,

            isActive: x.userStatus ?? x.UserStatus

          }));

          this.users.set(users);

        },

        error: (err) => {

          this.toastr.error(
            err?.error?.message ||
            err?.message ||
            'Something went wrong. Please try again.',
            'Error'
          );

        }

      });

  }

  //-------------------------------------
  // Create User
  //-------------------------------------

  createUser() {

    this.selectedUser.set(null);

    queueMicrotask(() => {

      this.showModal.set(true);

    });

  }

  //-------------------------------------
  // Edit User
  //-------------------------------------

  edit(user: User) {
    console.log(user)

    this.selectedUser.set({ ...user });

    this.showModal.set(true);

  }

  //-------------------------------------
  // Close Modal
  //-------------------------------------

  closeModal() {

    this.showModal.set(false);

    this.selectedUser.set(null);

  }

  //-------------------------------------
  // Save User
  //-------------------------------------

  saveUser(user: User) {


    const model = {

      Id: user.id,

      UserName: user.userName,

      Email: user.email,

      PhoneNumber: user.phoneNumber,

      Password: user.password,

      RoleId: user.roleId,

      CreatedBy: this.loggedInId(),
      UpdatedBy: this.loggedInId()

    };

    console.log(model)

    const request = user.id

      ? this.apiService.PutRequest(
        'UserManagement/UpdateUser',
        model
      )

      : this.apiService.PostRequest(
        'UserManagement/CreateUser',
        model
      );
      console.log( model , request)

    request.subscribe({

      next: (res: any) => {

        if (res.messageType === 'success') {

          this.toastr.success(res.message);

          this.getUsers();

          this.closeModal();

        }
        else {

          this.toastr.warning(res.message);

        }

      },

      error: (err) => {

        this.toastr.error(

          err?.error?.message ||

          err?.message ||

          'Something went wrong.'

        );

      }

    });

  }

  //-------------------------------------
  // Delete User
  //-------------------------------------

  delete(user: User) {

    Swal.fire({

      title: 'Delete User?',

      text: `Are you sure you want to delete "${user.userName}"?`,

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText: 'Delete',

      cancelButtonText: 'Cancel',

      confirmButtonColor: '#dc2626',

      cancelButtonColor: '#6b7280',

      reverseButtons: true

    }).then(result => {

      if (!result.isConfirmed) return;

      this.apiService
        .DeleteRequest(
          'UserManagement/DeleteUser',
          user.id
        )
        .subscribe({

          next: (res: any) => {

            if (res.messageType === 'success') {
              this.getUsers();
              this.toastr.success(res.message);
            }
            else {
              this.toastr.warning(res.message);
            }
          },

          error: (err) => {

            this.toastr.error(

              err?.error?.message ||

              'Unable to delete user.'

            );

          }

        });

    });

  }


}
