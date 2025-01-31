import {Component, inject} from '@angular/core';
import {SeriesService} from "../../services/series.service";
import {Serie} from "../../common/series";
import {RouterLink} from "@angular/router";
import {NavbarComponent} from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private readonly data: SeriesService = inject(SeriesService);
  series: Serie[] = [];

  toast = {
    body: '',
    duration: 2000,
    color: 'bg-success'
  }
  toastShow = false;

  constructor() {
    this.loadSeries();
  }

  private loadSeries() {
    this.data.getSeries().subscribe({
      next: value => {
        this.series = value.data;
      },
      error: err => {
        this.showToast(err.message, 'bg-danger');
      },
      complete: () => {
        this.showToast('Series cargadas', 'bg-success');
        console.log('series cargadas')
      }
    });
  }

  private showToast(mensaje: string, color: string) {
    this.toast.body = mensaje;
    this.toast.color = color;
    this.toastShow = true
    setTimeout(() => {
      this.toastShow = false;
    }, 2000);
  }
}
