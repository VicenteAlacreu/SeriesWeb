import { Routes } from '@angular/router';
import {HomeComponent} from "./componentes/home/home.component";
import {DetailComponent} from "./componentes/detail/detail.component";

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/inicio',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    component: HomeComponent
  },
  {
    path: 'detalle/:id',
    component: DetailComponent
  }
];
