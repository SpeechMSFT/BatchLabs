import { NgModule } from "@angular/core";
import { MaterialModule } from "app/core";

import { SummaryCardComponent } from "./summary-card.component";

@NgModule({
    imports: [
        MaterialModule,
    ],
    exports: [SummaryCardComponent],
    declarations: [SummaryCardComponent],
})
export class SummaryCardModule { }
