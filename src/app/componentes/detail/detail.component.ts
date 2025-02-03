import {Component, inject, Input} from '@angular/core';
import {SeriesService} from "../../services/series.service";
import {Serie} from "../../common/series";
import {ActivatedRoute, Router} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    NavbarComponent,
    NgClass
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent {
  private readonly data: SeriesService = inject(SeriesService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  serie!: Serie;
  toast = {
    body: '',
    duration: 2000,
    color: 'bg-success'
  }
  toastShow = false;

  constructor() {
    this.loadSerie();
  }

  private loadSerie() {
    const id = this.activatedRoute.snapshot.params['id'];
    this.data.getSerieById(id).subscribe({
      next: value =>{
        this.serie = value.data;
      },
      error: err => {
        console.error(err.message)
      },
      complete: () => {
        console.log('Serie cargada')
      }
    });
  }
}
