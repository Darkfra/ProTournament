import { Injectable } from '@angular/core';
import {Team} from './../models/team'
// conexion a firebase
import {AngularFireDatabase,AngularFireList} from 'angularfire2/database';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  // list firebase
  teamsList: AngularFireList<any>;
  selectTeam: Team = new Team();

  constructor(private firebase: AngularFireDatabase) { }

  getTeams(){
    return this.teamsList = this.firebase.list('teams');
  }
  insertTeam(team: Team){
    this.teamsList.push({
      name: team.name,
      img: team.img,
      description: team.description,
      leader1: team.leader1,
      leader2: team.leader2,
      leader3: team.leader3,
      region: team.region
    })
  }
  updateTeam(team: Team){
    this.teamsList.update(team.$key,{
      name: team.name,
      img: team.img,
      description: team.description,
      leader1: team.leader1,
      leader2: team.leader2,
      leader3: team.leader3,
      region: team.region
    });
  }
  deleteTeam($key: string){
    this.teamsList.remove($key);
  }
}
