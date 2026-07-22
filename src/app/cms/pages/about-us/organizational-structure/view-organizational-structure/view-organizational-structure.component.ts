import {
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal
} from '@angular/core';

import { ConfigService } from '../../../../../services/config.service';


export interface OrganizationMember {

  id: number;

  name: string;

  designation: string;

  parentId: number | null;

  profilePhoto: string | null;

  displayOrder: number;

  expanded: boolean;

}


@Component({

  selector:
    'app-view-organizational-structure',

  standalone: true,

  imports: [],

  templateUrl:
    './view-organizational-structure.component.html',

  styleUrl:
    './view-organizational-structure.component.scss'

})
export class ViewOrganizationalStructureComponent {


  constructor(
    private config: ConfigService
  ) { }


  // ---------------------------------------
  // Close Event
  // ---------------------------------------

  @Output()
  close =
    new EventEmitter<void>();


  // ---------------------------------------
  // Receive Data From Parent
  // ---------------------------------------

  @Input()
  set members(
    value: any[]
  ) {

    this._members.set(

      value.map(member => ({

        id:
          member.id,

        name:
          member.name,

        designation:
          member.designation,

        parentId:
          member.parentId,

        profilePhoto:
          member.photo ??
          member.profilePhoto ??
          null,

        displayOrder:
          member.displayOrder,

        expanded:
          member.expanded ??
          false

      }))

    );

  }


  private _members =
    signal<OrganizationMember[]>([]);


  // ---------------------------------------
  // Image URL
  // ---------------------------------------

  imageURL =
    signal('');


  // ---------------------------------------
  // Search
  // ---------------------------------------

  search =
    signal('');


  // ---------------------------------------
  // Constructor
  // ---------------------------------------

  ngOnInit(): void {

    this.imageURL.set(

      this.config.get(
        'IMAGE_API_URL'
      )

    );

  }


  // ---------------------------------------
  // Close Modal
  // ---------------------------------------

  closeModal(): void {

    this.close.emit();

  }


  // ---------------------------------------
  // Root Members
  // ---------------------------------------

  rootMembers =
    computed(() => {

      const keyword =
        this.search()
          .trim()
          .toLowerCase();


      return this._members()

        .filter(member => {

          if (
            member.parentId !== null
          ) {

            return false;

          }


          if (!keyword) {

            return true;

          }


          return (

            member.name
              .toLowerCase()
              .includes(keyword)

            ||

            member.designation
              .toLowerCase()
              .includes(keyword)

            ||

            this.hasMatchingDescendant(
              member.id,
              keyword
            )

          );

        })

        .sort(
          (a, b) =>
            a.displayOrder -
            b.displayOrder
        );

    });


  // ---------------------------------------
  // Matching Descendant
  // ---------------------------------------

  hasMatchingDescendant(

    parentId: number,

    keyword: string

  ): boolean {


    const children =
      this._members()

        .filter(member =>

          member.parentId === parentId

        );


    return children.some(child =>

      child.name
        .toLowerCase()
        .includes(keyword)

      ||

      child.designation
        .toLowerCase()
        .includes(keyword)

      ||

      this.hasMatchingDescendant(

        child.id,

        keyword

      )

    );

  }


  // ---------------------------------------
  // Get Children
  // ---------------------------------------

  getChildren(

    parentId: number

  ): OrganizationMember[] {


    const keyword =
      this.search()
        .trim()
        .toLowerCase();


    return this._members()

      .filter(member => {

        if (
          member.parentId !== parentId
        ) {

          return false;

        }


        if (!keyword) {

          return true;

        }


        return (

          member.name
            .toLowerCase()
            .includes(keyword)

          ||

          member.designation
            .toLowerCase()
            .includes(keyword)

          ||

          this.hasMatchingDescendant(

            member.id,

            keyword

          )

        );

      })

      .sort(

        (a, b) =>

          a.displayOrder -

          b.displayOrder

      );

  }


  // ---------------------------------------
  // Has Children
  // ---------------------------------------

  hasChildren(

    memberId: number

  ): boolean {


    return this._members()

      .some(member =>

        member.parentId === memberId

      );

  }


  // ---------------------------------------
  // Toggle
  // ---------------------------------------

  toggle(

    member: OrganizationMember

  ): void {


    this._members.update(

      members =>

        members.map(item =>

          item.id === member.id

            ? {

              ...item,

              expanded:
                !item.expanded

            }

            : item

        )

    );

  }


  // ---------------------------------------
  // Expand All
  // ---------------------------------------

  expandAll(): void {


    this._members.update(

      members =>

        members.map(member => ({

          ...member,

          expanded: true

        }))

    );

  }


  // ---------------------------------------
  // Collapse All
  // ---------------------------------------

  collapseAll(): void {


    this._members.update(

      members =>

        members.map(member => ({

          ...member,

          expanded: false

        }))

    );

  }


  // ---------------------------------------
  // Search
  // ---------------------------------------

  onSearch(

    event: Event

  ): void {


    const input =
      event.target as HTMLInputElement;


    const keyword =
      input.value
        .trim()
        .toLowerCase();


    this.search.set(keyword);


    if (!keyword) {

      return;

    }


    const matchingMembers =
      this._members()

        .filter(member =>

          member.name
            .toLowerCase()
            .includes(keyword)

          ||

          member.designation
            .toLowerCase()
            .includes(keyword)

        );


    const parentIds =
      new Set<number>();


    matchingMembers.forEach(member => {


      let parentId =
        member.parentId;


      while (
        parentId !== null
      ) {


        parentIds.add(parentId);


        const parent =
          this._members()

            .find(
              x =>
                x.id === parentId
            );


        parentId =
          parent?.parentId ??
          null;

      }

    });


    this._members.update(

      members =>

        members.map(member => ({

          ...member,

          expanded:

            matchingMembers.some(

              x =>
                x.id === member.id

            )

            ||

            parentIds.has(

              member.id

            )

        }))

    );

  }

}
