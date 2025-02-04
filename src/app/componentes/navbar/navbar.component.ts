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
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly data: SeriesService = inject(SeriesService);
  private readonly router: Router = inject(Router);
  private readonly modalService: NgbModal = inject(NgbModal);

  private id = '';

  constructor() {
    this.id = this.activatedRoute.snapshot.params['id'];
  }

  borrarSerie(){

    this.data.deleteSerie(this.id).subscribe({
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

  editModal(){
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.editar = true;
    const ids: string = this.activatedRoute.snapshot.params['id'];
    modalRef.componentInstance.idSerie = ids;

  }

  addModal(){
    const modalRef = this.modalService.open(ModalComponent);
    modalRef.componentInstance.editar = false;
  }



}
