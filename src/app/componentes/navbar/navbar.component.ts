import {Component, inject, model, ModelSignal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SeriesService} from "../../services/series.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {ModalComponent} from "../modal/modal.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  btnEdit: ModelSignal<string> = model.required()
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly data: SeriesService = inject(SeriesService);
  private readonly router: Router = inject(Router);
  private readonly modalService: NgbModal = inject(NgbModal);

  constructor() {

  }

  borrarSerie(){
    const id = this.route.snapshot.params['id'];
    this.data.deleteSerie(id).subscribe({
      next: () => {
        console.log('Serie deleted!');
      },
      error: err => {
        console.error(err)
      },
      complete: () => {
        this.router.navigateByUrl('/inicio')
      }
    })
  }

  addModal(){
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.editar = false;
  }

  editModal(){
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.editar = true;
    modalRef.componentInstance.id = this.route.snapshot.params['id'];
  }

}
