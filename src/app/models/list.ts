import { AngularFireList } from 'angularfire2/database';

export class List<T> {

    private data: AngularFireList<T>;

    public constructor() {
    }

    get list(): AngularFireList<T> {
        return this.data;
    }

    public print(): void {
        console.log(this.data);
    }

}
