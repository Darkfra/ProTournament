import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// FIREBASE
import { AngularFirestore } from 'angularfire2/firestore';

// MODELS
import { List } from '../models/list';
import { Team } from '../models/team';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends List<Team> {

  constructor(private firestore: AngularFirestore) {
    super();
  }

  public create(item: Team, collection: string): any {
    return this.firestore.collection(collection).add(item);
  }

  public update(item: Team, documentId: string, collection: string): any {
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
