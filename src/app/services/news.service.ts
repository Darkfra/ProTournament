import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// FIREBASE
import { AngularFirestore } from 'angularfire2/firestore';

// MODELS
import { List } from '../models/list';
import { News } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class NoticiaService extends List<News> {

  constructor(private firestore: AngularFirestore) {
    super();
  }

  public create(item: News, collection: string): any {
    return this.firestore.collection(collection).add(item);
  }

  public update(item: News, documentId: string, collection: string): any {
    return this.firestore.collection(collection).doc(documentId).set(item);
  }

  public delete(documentId: string, collection: string): any {
    return this.firestore.collection(collection).doc(documentId).delete();
  }

  public get(documentId: string, collection: string): Observable<any> {
    return this.firestore.collection(collection).doc(documentId).snapshotChanges();
  }

  public gets(collection: string): Observable<any> {
    return this.firestore.collection(collection).snapshotChanges();
  }
}
