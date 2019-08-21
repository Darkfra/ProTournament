import { User } from './../models/user';
import { Injectable } from '@angular/core';
// conexion a firebase
import {AngularFireDatabase,AngularFireList} from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // list firebase
  userList: AngularFireList<any>;
  selectUser: User = new User();

  constructor(private firebase: AngularFireDatabase) { }

  getUsers(){
    return this.userList = this.firebase.list('users');
  }
  insertUser(user: User){
    this.userList.push({
      fullName: user.fullName,
      nickName: user.nickName,
      email: user.email,
      photoURL: user.photoURL,
      singupBy: user.singupBy,
      teamKey: user.teamKey,
      idPlay: user.idPlay,
      region: user.paginaStrimer,
      rolKey: user.rolKey
    });
  }
  updateUser(user: User){
    this.userList.update(user.$key,{
      fullName: user.fullName,
      nickName: user.nickName,
      email: user.email,
      photoURL: user.photoURL,
      singupBy: user.singupBy,
      teamKey: user.teamKey,
      idPlay: user.idPlay,
      region: user.paginaStrimer,
      rolKey: user.rolKey
    });

  }
  deleteUser($key: string){
    this.userList.remove($key);
  }

}
