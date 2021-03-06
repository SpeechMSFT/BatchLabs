import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { autobind } from "app/core";
import { AsyncSubject, Observable } from "rxjs";

import "./confirmation-dialog.scss";

@Component({
    selector: "bl-confirmation-dialog",
    templateUrl: "confirmation-dialog.html",
})
export class ConfirmationDialogComponent {
    public title: string;
    public description: string;
    public execute: () => Observable<any>;

    public response = new AsyncSubject<boolean>();

    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>) {
        this.response.next(false);
    }

    @autobind()
    public submit() {
        return this.execute();
    }

    public done() {
        this.response.complete();
    }
}
