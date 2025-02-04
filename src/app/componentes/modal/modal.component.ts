
import {Component, inject, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SeriesService} from "../../services/series.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup, FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {Categoria} from "../../common/series";
import {FormValidators} from "../../validators/FormValidators";
import {Router} from "@angular/router";
import {formatDate} from "@angular/common";


@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent implements OnInit{
  //servicios
  private readonly data: SeriesService = inject(SeriesService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);

  //Variables externas
  @Input({required: true}) editar!: boolean;
  @Input({required: false}) idSerie!: string;

  //Variables
  activeModal = inject(NgbActiveModal);
  categorias: Categoria[] = [];


  formSerie: FormGroup = this.formBuilder.group({
    _id: [],
    titulo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255), FormValidators.notOnlyWhiteSpace]],
    sinopsis: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255), FormValidators.notOnlyWhiteSpace]],
    fechaEmision: ['', [Validators.required]],
    numeroCapitulos: [0, Validators.required],
    imagenes: [],
    categorias: this.formBuilder.array([])
  });

  formNuevaCategoria: FormGroup = this.formBuilder.group({
    newCategoryName: ['', [Validators.required, Validators.minLength(2)]], // Nombre de la categoría
    newCategoryImage: ['', [Validators.required]] // URL de la imagen
  });

  showNewCategoryForm: boolean = false;


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
  get newCategoriyName(): any{
    return this.formNuevaCategoria.get('newCategoryName');
  }
  get newCategoryImage(): any{
    return this.formNuevaCategoria.get('newCategoryImage');
  }

  ngOnInit() {
    this.cargarCategorias();
    this.cargarSerie();
  }

  //logica
  constructor() {
    this.addCategoria();
  }


  onSubmit() {
    if (this.formSerie.invalid) {
      console.error('Formulario Inválido');
      return;
    }

    const formValue = this.formSerie.getRawValue();

    // Mapea las categorías correctamente
    formValue.categorias = formValue.categorias.map((cat: any) => ({
      _id: cat._id,
      nombre: cat.nombre,
      imagen: cat.imagen
    }));

    if (this.editar) {
      this.data.updateSerie(formValue).subscribe({
        next: value => {
          console.log(value);
        },
        complete: () => {
          console.log('Updated');
          this.activeModal.dismiss();
        },
        error: err => {
          console.error(err);
        }
      });
    } else {
      this.data.addSerie(formValue).subscribe({
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
      });
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

  addCategoria() {
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
    const selectedCategoryId = this.categoriasF.controls[index].get('selectedCategory')?.value;

    if (selectedCategoryId) {
      const selectedCategory = this.categorias.find(cat => cat._id === selectedCategoryId);

      if (selectedCategory) {
        this.categoriasF.controls[index].patchValue({
          nombre: selectedCategory.nombre,
          imagen: selectedCategory.imagen,
          _id: selectedCategory._id
        });
      }
    } else {
      // Limpia los campos si no se selecciona nada
      this.categoriasF.controls[index].patchValue({
        nombre: '',
        imagen: '',
        _id: ''
      });
    }
  }

  guardarNuevaCategoria() {
    if (this.formNuevaCategoria.invalid) {
      console.error('Formulario de categoría inválido');
      return;
    }

    const newCategoryName = this.formNuevaCategoria.get('newCategoryName')?.value;
    const newCategoryImage = this.formNuevaCategoria.get('newCategoryImage')?.value;

    const nuevaCategoria = {
      _id: `local-${Date.now()}`, // ID temporal
      nombre: newCategoryName,
      imagen: newCategoryImage
    };

    // Agrega la nueva categoría a la lista de categorías
    this.categorias.push(nuevaCategoria);

    // Agrega la nueva categoría al FormArray de categorías
    const categoriaForm = this.formBuilder.group({
      nombre: [newCategoryName, [Validators.required, Validators.minLength(2)]],
      imagen: [newCategoryImage, Validators.required],
      selectedCategory: [nuevaCategoria._id, Validators.required]
    });
    this.categoriasF.push(categoriaForm);

    // Limpia el formulario de nueva categoría
    this.formNuevaCategoria.reset();
    this.showNewCategoryForm = false;

    console.log('Nueva categoría creada:', nuevaCategoria);
  }

  private cargarSerie() {
    if (this.idSerie){
      this.data.getSerieById(this.idSerie).subscribe({
        next: value => {
          const fecha = new Date(value.data.fechaEmision)
          const anio = fecha.getFullYear();
          const mes = (fecha.getMonth()).toString().padStart(2, '0');
          const dia = fecha.getDate().toString().padStart(2, '0');

          const formato = `${anio}-${mes}-${dia}`;
          value.data.fechaEmision = formato;
          this.formSerie.patchValue(value.data);

          const data = value.data.categorias;
          const dataFA = new FormArray<any>([]);

          data.forEach(dat => dataFA.push(new FormControl(dat)))
          this.formSerie.setControl('categorias',dataFA);
          console.log(this.formSerie.getRawValue())
        },
        error: err => {
          console.error(err);
        },
        complete: () => {
          console.log('Serie cargada');
        }
      });
    } else {
      this.formSerie.reset();
    }
  }
}
