import {Component, inject, model, ModelSignal} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SeriesService} from "../../services/series.service";

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

}
