import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { autobind } from "app/core";
import { List } from "immutable";
import { Observable } from "rxjs";

import { SidebarRef } from "app/components/base/sidebar";
import { Metadata } from "app/models";

@Component({
    selector: "bl-edit-metadata-form",
    templateUrl: "edit-metadata-form.html",
})
export class EditMetadataFormComponent {
    public set metadata(metadata: List<Metadata>) {
        this.form.setValue(metadata.toJS());
    }

    public save: (metadata: Metadata[]) => Observable<any>;

    public form = new FormControl([]);

    constructor(public sidebarRef: SidebarRef<any>) {
    }

    @autobind()
    public submit() {
        return this.save(this.form.value);
    }
}
