import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

export class LiveDataSource extends DataSource<any> {

    data = new BehaviorSubject<any[]>([]);

    connect(): Observable<any[]> {
        return this.data;
    }

    disconnect() {
        this.data.complete();
    }

}
