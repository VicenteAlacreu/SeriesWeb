import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ApiResponseMessage, GetOneApiResponse, Serie, SeriesApi} from "../common/series";
import {environment} from "../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private readonly http: HttpClient = inject(HttpClient);
  constructor() { }
  public getSeries(): Observable<SeriesApi> {
    return this.http.get<SeriesApi>(environment.urlApi);
  }

  public getSerieById(id: string): Observable<GetOneApiResponse> {
    return this.http.get<GetOneApiResponse>(environment.urlApi + 'serie/' + id);
  }

  public getCategorias(): Observable<SeriesApi> {
    return this.http.get<SeriesApi>(environment.urlApi + 'categorias/list');
  }

  public getSeriesByCategoria(cat: string): Observable<SeriesApi> {
    return this.http.get<SeriesApi>(environment.urlApi + 'categorias?c=' + cat);
  }

  public addSerie(serie: Serie): Observable<ApiResponseMessage>{
    return this.http.post<ApiResponseMessage>(environment.urlApi, serie);
  }

  public updateSerie(serie: Serie): Observable<ApiResponseMessage>{
    return this.http.put<ApiResponseMessage>(environment.urlApi + serie._id, serie);
  }

  public deleteSerie(id: string): Observable<ApiResponseMessage>{
    return this.http.delete<ApiResponseMessage>(environment.urlApi + id);
  }
}
