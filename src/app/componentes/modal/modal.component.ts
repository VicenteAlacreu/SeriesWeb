import {Component, inject, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SeriesService} from "../../services/series.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Categoria} from "../../common/series";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  //servicios
  private readonly data: SeriesService = inject(SeriesService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  //Variables externas
  @Input({required: true}) editar!: boolean;
  //Variables
  activeModal = inject(NgbActiveModal);
  categorias: Categoria[] = [];

  formSerie: FormGroup = this.formBuilder.group({
    _id: [''],
    titulo: [''],
    sinopsis: [''],
    fechaEmision: [''],
    numeroCapitulos: [''],
    imagenes: [''],
    categorias: [''],
  });

  myNewCategoria = new FormGroup({
    newCategoria: new FormControl('')
  });

  // GETTERS
  get titulo(): any{
    return this.formSerie.get('titulo');
  }
  get sinopsis(): any{
    return this.formSerie.get('sinopsis');
  }
  get fechaEmision(): any{
    return this.formSerie.get('fechaEmision');
  }
  get numeroCapitulos(): any{
    return this.formSerie.get('numeroCapitulos');
  }
  get categoriasF(): any{
    return this.formSerie.get('categorias');
  }
  get imagenes(): any{
    return this.formSerie.get('imagenes');
  }
  get catNombre(): any{
    return this.formSerie.get('categorias.nombre');
  }
  get catImagen(): any{
    return this.formSerie.get('categorias.imagen');
  }
  get newCategoria(): any{
    return this.myNewCategoria.get('newCategoria');
  }

  //logica
  constructor() {
    this.cargarCategorias();
  }
  onSubmit() {
    if(this.editar){
      this.data.updateSerie(this.formSerie.getRawValue()).subscribe(
        {
          next: value => {
            console.log(value);
          },
          complete: () => {
            console.log('Updated');
            this.activeModal.dismiss();
          },
          error: err => {
            console.error(err)}
        }
      )
    }else {
      this.data.addSerie(this.formSerie.getRawValue()).subscribe(
        {
          next: value => {
            console.log(value);
          },
          complete: () => {
            console.log('Movie added');},
          error: err => {
            console.error(err);
          }
        }
      )
    }
  }

  private cargarCategorias() {
    this.data.getCategorias().subscribe({
      next: value => {
        this.categorias = value.data;
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        console.log('Categorias cargadas');
      }
    })
  }
}
