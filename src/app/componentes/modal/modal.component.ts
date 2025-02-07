
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
  private readonly router: Router = inject(Router);

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
    imagenes: this.formBuilder.array([]),
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
  get imagenesF(): FormArray{
    return this.formSerie.get('imagenes') as FormArray;
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
      this.formSerie.getRawValue()

      // Imprime los errores de cada control
      Object.keys(this.formSerie.controls).forEach(key => {
        const control = this.formSerie.get(key);
        if (control?.errors) {
          console.log(`Errores en el control "${key}":`, control.errors);
        }
      });

      return;
    }

    const formValue = this.formSerie.getRawValue();

    formValue.categorias = formValue.categorias.map((cat: any) => ({
      nombre: cat.nombre,
      imagen: cat.imagen,
      _id: cat._id
    }));


    formValue.imagenes = formValue.imagenes.map((img: any) => img.url);

    // Formatea la fecha en formato ISO
    formValue.fechaEmision = new Date(formValue.fechaEmision).toISOString();

    console.log('JSON a enviar:', formValue);

    if (this.editar) {
      this.data.updateSerie(formValue).subscribe({
        next: value => {
          console.log(value);
        },
        complete: () => {
          console.log('Updated');
          this.activeModal.dismiss();
          this.router.navigateByUrl("/inicio")
        },
        error: err => {
          console.error('Error al actualizar:', err.message);
        }
      });
    } else {
      this.data.addSerie(formValue).subscribe({
        next: value => {
          console.log(value);
        },
        complete: () => {
          console.log('Serie añadida');
          this.activeModal.dismiss();
          this.router.navigateByUrl("/inicio")
        },
        error: err => {
          console.error('Error al añadir:', err.message);
        }
      });
    }
  }


  //Logica categorias
  addCategoria() {
    const categoriaForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      imagen: ['', Validators.required],
      selectedCategory: [null, Validators.required]
    });

    this.categoriasF.push(categoriaForm);
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
  removeCategoria(i: number){
    this.categoriasF.removeAt(i);
  }
  trackByCategoriaId(index: number, categoria: any): string {
    return categoria._id || index.toString();  // Utiliza el _id como clave si existe
  }

  //Logica Imagenes
  addNewImagen() {
    const imagenForm = this.formBuilder.group({
      url: ['', Validators.required] // Cada imagen tendrá una URL
    });
    this.imagenesF.push(imagenForm);
  }
  removeImagen(index: number) {
    this.imagenesF.removeAt(index);
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
  private cargarCategorias() {
    this.categorias = [];
    this.data.getCategorias().subscribe({
      next: value => {
        const nombresUnicos = new Set<string>();
        this.categorias = value.data.filter((categoria: Categoria) => {
          if (!nombresUnicos.has(categoria.nombre)) {
            nombresUnicos.add(categoria.nombre);
            return true; // Mantener la categoría
          }
          return false; // Descartar la categoría duplicada
        });
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        console.log('Categorias cargadas ' + this.categorias.length);
      }
    })
  }
}
