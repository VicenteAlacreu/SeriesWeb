export interface SeriesApi {
  status: boolean;
  data: any[];
}

export interface ApiResponseMessage{
  status: boolean;
  message: string;
}

export interface GetOneApiResponse {
  status: boolean;
  data: Serie;
}

export interface Serie {
  _id: string;
  imagenes: string[];
  titulo: string;
  categorias: Categoria[];
  numeroCapitulos: number;
  fechaEmision: string;
  sinopsis: string;
}

export interface Categoria {
  nombre: string;
  imagen: string;
  _id: string;
}

