import {Component, inject, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SeriesService} from "../../services/series.service";
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Categoria} from "../../common/series";
import {FormValidators} from "../../validators/FormValidators";
import {Router} from "@angular/router";


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  //servicios
  private readonly data: SeriesService = inject(SeriesService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  //Variables externas
  @Input({required: true}) editar!: boolean;
  @Input({required: false}) id!: string;
  //Variables
  activeModal = inject(NgbActiveModal);
  categorias: Categoria[] = [];


  formSerie: FormGroup = this.formBuilder.group({
    _id: [''],
    titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255), FormValidators.notOnlyWhiteSpace]],
    sinopsis: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255), FormValidators.notOnlyWhiteSpace]],
    fechaEmision: ['', [Validators.required]],
    numeroCapitulos: [0, Validators.required],
    imagenes: [],
    categorias: this.formBuilder.array([])
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
    return this.formSerie.get('categorias') as FormArray;
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
  get selectedCategorias(): any{
    return this.myNewCategoria.get('selectedCategorias');
  }

  //logica
  constructor() {
    this.addNewCategoria();
    this.cargarCategorias();
    this.cargarSerie();
    console.log(this.categoriasF.value);
  }


  onSubmit() {
    if (this.formSerie.invalid) {
      console.error('Formulario Invalido');
      return;
    }

    const formValue = this.formSerie.getRawValue();
    formValue.categorias = formValue.categorias.map((cat: any) => ({
      _id: cat.selectedCategory,
      nombre: cat.nombre,
      imagen: cat.imagen,
    }));

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
      this.data.addSerie(formValue).subscribe(
        {
          next: value => {
            console.log(value);
          },
          complete: () => {
            console.log('Movie added');
            this.activeModal.dismiss();

            },
          error: err => {
            console.error(err);
          }
        }
      )
    }
    console.log(this.formSerie.getRawValue());


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
        console.log('Categorias cargadas ' + this.categorias.length);
      }
    })
  }

  addNewCategoria() {
    const categoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      imagen: ['', Validators.required],
      selectedCategory: [null, Validators.required]
    });

    this.categoriasF.push(categoriaForm);

  }

  removeCategoria(i: number){
    this.categoriasF.removeAt(i);
  }

  onCategoryChange(index: number) {
    const selectedCategoryId =
      this.categoriasF.controls[index].get('selectedCategory')?.value;
    if (selectedCategoryId) {
      const selectedCategory = this.categorias.find(cat => cat._id ===
        selectedCategoryId);

      if (selectedCategory) {
        this.categoriasF.controls[index].patchValue({
          nombre: selectedCategory.nombre,
          imagen: selectedCategory.imagen,
          _id: selectedCategory._id
        });
        console.log(selectedCategory);
      }
    } else {
// Limpiamos los campos si no se selecciona nada
      this.categoriasF.controls[index].patchValue({
        nombre: '',
        imagen: '',
        _id: ''
      });
    }
  }

  private cargarSerie() {
    if (this.id){
      this.editar = true;
      this.data.getSerieById(this.id).subscribe({
        next: value => {
          this.formSerie.setValue(value.data);
        },
        error: err => {
          console.error(err);
        },
        complete: () => {
          console.log('Serie cargada');
        }
      })
    } else {
      this.editar = false;
      this.formSerie.reset();
    }
  }
}
