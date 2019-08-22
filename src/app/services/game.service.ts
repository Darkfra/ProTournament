import { Injectable } from '@angular/core';

// MODELS
import { List } from '../models/list';
import { Game } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GameService extends List<Game> {

  constructor() {
    super();
  }
}
