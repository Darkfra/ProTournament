import { User } from './../models/user';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  image: any;



  constructor(public afAuth: AngularFireAuth, private afs: AngularFirestore){}

  doFacebookLogin(){
    return new Promise<any>((resolve, reject) => {
      let provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
        console.log(res);
      }, err => {
        console.log(err);
        reject(err);
      })
    })
 }

 loginGoogle(){
   return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
 }
 logoutUser(){
   return this.afAuth.auth.signOut();
 }
 isAuth(){
   return this.afAuth.authState.pipe(( auth => auth ));
 }


 doGoogleLogin(){
  return new Promise<any>((resolve, reject) => {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    this.afAuth.auth
    .signInWithPopup(provider)
    .then(res => {
      resolve(res);
      console.log(res);
    })
  })
}


}
