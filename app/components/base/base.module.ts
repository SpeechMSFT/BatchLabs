import { ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/core";

// components
import { IconComponent } from "app/components/base/icon";
import { AdvancedFilterModule } from "./advanced-filter";
import { BackgroundTaskModule } from "./background-task";
import { BannerComponent, BannerOtherFixDirective } from "./banner";
import { BreadcrumbModule } from "./breadcrumbs";
import { ButtonsModule } from "./buttons";
import { CardComponent } from "./card";
import { ChartsModule } from "./charts";
import { ContextMenuModule } from "./context-menu";
import { DatetimePickerComponent } from "./datetime-picker";
import { DialogsModule } from "./dialogs";
import { DropdownModule } from "./dropdown";
import { DurationPickerComponent } from "./duration-picker";
import { EditorModule } from "./editor";
import { FocusSectionModule } from "./focus-section";
import { FormModule } from "./form";
import { GraphsModule } from "./graphs";
import { GuardsModule } from "./guards";
import { InfoBoxModule } from "./info-box";
import {
    DeleteSelectedItemsDialogComponent, EntityDetailsListComponent, ListAndShowLayoutComponent, ListLoadingComponent,
} from "./list-and-show-layout";
import { LoadingComponent, SimpleLoadingComponent } from "./loading";
import { NotificationModule } from "./notifications";
import { PinnedDropDownComponent } from "./pinned-entity-dropdown";
import { PropertyListModule } from "./property-list";
import { QuickListModule } from "./quick-list";
import { RefreshButtonComponent } from "./refresh-btn";
import { ScrollableModule } from "./scrollable";
import { SidebarModule } from "./sidebar";
import { SimpleDialogComponent } from "./simple-dialog";
import { SplitPaneModule } from "./split-pane";
import { SummaryCardModule } from "./summary-card";
import { TableModule } from "./table";
import { TabsModule } from "./tabs";
import { TagsModule } from "./tags";
import { TimespanComponent } from "./timespan";
import { VirtualScrollModule } from "./virtual-scroll";
import { VTabsModule } from "./vtabs";

// Add submodules there
const modules = [
    AdvancedFilterModule,
    BreadcrumbModule,
    ButtonsModule,
    BackgroundTaskModule,
    ChartsModule,
    ContextMenuModule,
    DialogsModule,
    DropdownModule,
    EditorModule,
    FocusSectionModule,
    InfoBoxModule,
    NotificationModule,
    PropertyListModule,
    GraphsModule,
    GuardsModule,
    QuickListModule,
    SidebarModule,
    TableModule,
    TabsModule,
    TagsModule,
    FormModule,
    ScrollableModule,
    SplitPaneModule,
    SummaryCardModule,
    VirtualScrollModule,
    VTabsModule,
];

// Add subcomponnent not in a module here
const components = [
    BannerComponent,
    BannerOtherFixDirective,
    CardComponent,
    TimespanComponent,
    EntityDetailsListComponent,
    DatetimePickerComponent,
    DurationPickerComponent,
    IconComponent,
    ListAndShowLayoutComponent,
    PinnedDropDownComponent,
    SimpleLoadingComponent,
    SimpleDialogComponent,
    LoadingComponent,
    RefreshButtonComponent,
    ListLoadingComponent,
    DeleteSelectedItemsDialogComponent,
];

@NgModule({
    declarations: components,
    entryComponents: [
        DeleteSelectedItemsDialogComponent,
        SimpleDialogComponent,
    ],
    exports: [...modules, ...components],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        RouterModule,
        ...modules,
    ],
    providers: [
    ],
})
export class BaseModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: BaseModule,
            providers: [],
        };
    }
}
