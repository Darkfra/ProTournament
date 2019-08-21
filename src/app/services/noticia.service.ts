import { Injectable } from '@angular/core';
import { AngularFireList, AngularFireDatabase } from 'angularfire2/database';
import { Noticia } from '../models/noticia';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService {

  noticiaList: AngularFireList<any>;
  selectNoticia: Noticia = new Noticia();

  constructor(private firebase: AngularFireDatabase) { }

  getNoticias(){
    return this.noticiaList = this.firebase.list('noticias');

  }
  insertNoticia(noticia: Noticia){
    this.noticiaList.push({
      userKey: noticia.userKey,
      date: noticia.date,
      title: noticia.title,
      description: noticia.description,
      img: noticia.img

    })
  }
  updateNoticia(noticia: Noticia){
    this.noticiaList.update(noticia.$key,{
      userKey: noticia.userKey,
      date: noticia.date,
      title: noticia.title,
      description: noticia.description,
      img: noticia.img
    })
  }
  deleteNoticia($key: string){
    this.noticiaList.remove($key);
  }
}
