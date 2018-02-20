import {
    ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild,
} from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { autobind } from "app/core";
import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { ListBaseComponent, listBaseProvider } from "app/components/base/browse-layout/list-base";
import { ContextMenu, ContextMenuItem } from "app/components/base/context-menu";
import { LoadingStatus } from "app/components/base/loading";
import { QuickListComponent, QuickListItemStatus } from "app/components/base/quick-list";
import { SidebarManager } from "app/components/base/sidebar";
import { TableComponent, TableConfig } from "app/components/base/table";
import { Pool } from "app/models";
import { PoolDecorator } from "app/models/decorators";
import { PinnedEntityService, PoolListParams, PoolService } from "app/services";
import { ListView } from "app/services/core";
import { ComponentUtils } from "app/utils";
import { Filter } from "app/utils/filter-builder";
import { DeletePoolDialogComponent, PoolResizeDialogComponent } from "../action";

@Component({
    selector: "bl-pool-list",
    templateUrl: "pool-list.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [listBaseProvider(() => PoolListComponent)],
})
export class PoolListComponent extends ListBaseComponent implements OnInit, OnDestroy {
    public LoadingStatus = LoadingStatus;
    public status: Observable<LoadingStatus>;
    public data: ListView<Pool, PoolListParams>;

    // Inheritance bugs https://github.com/angular/angular/issues/5415
    @Output()
    public itemSelected: EventEmitter<any>;

    @ViewChild(TableComponent)
    public table: TableComponent;

    @ViewChild(QuickListComponent)
    public list: QuickListComponent;

    public tableConfig: TableConfig = {
        showCheckbox: true,
    };

    public pools: List<PoolDecorator> = List([]);
    private _subs: Subscription[] = [];

    constructor(
        private poolService: PoolService,
        activatedRoute: ActivatedRoute,
        router: Router,
        private dialog: MatDialog,
        private sidebarManager: SidebarManager,
        changeDetector: ChangeDetectorRef,
        private pinnedEntityService: PinnedEntityService) {

        // super(dialog);
        super(changeDetector);
        this.data = this.poolService.listView();
        ComponentUtils.setActiveItem(activatedRoute, this.data);

        this.status = this.data.status;
        this._subs.push(poolService.onPoolAdded.subscribe((poolId) => {
            this.data.loadNewItem(poolService.get(poolId));
        }));
        this._subs.push(this.data.items.subscribe((pools) => {
            this.pools = List<PoolDecorator>(pools.map(x => new PoolDecorator(x)));
        }));
    }

    public ngOnInit() {
        this.data.fetchNext();
    }

    public ngOnDestroy() {
        this._subs.forEach(x => x.unsubscribe());
    }

    @autobind()
    public refresh(): Observable<any> {
        return this.data.refresh();
    }

    public handleFilter(filter: Filter) {
        if (filter.isEmpty()) {
            this.data.setOptions({});
        } else {
            this.data.setOptions({ filter: filter.toOData() });
        }

        this.data.fetchNext();
    }

    public poolStatus(pool: Pool): QuickListItemStatus {
        return pool.resizeErrors.size > 0 ? QuickListItemStatus.warning : null;
    }

    public poolStatusText(pool: Pool): string {
        if (pool.resizeErrors.size > 0) {
            return "Pool has a resize error";
        }

        return "";
    }

    public onScrollToBottom(x) {
        this.data.fetchNext();
    }

    public deleteSelected() {
        // TODO-TIM fix this
        // this.taskManager.startTask("", (backgroundTask) => {
            // const task = new DeletePoolTask(this.poolService, this.selectedItems);
            // task.start(backgroundTask);
            // return task.waitingDone;
        // });
    }

    public deletePool(poolDecorator: PoolDecorator) {
        const dialogRef = this.dialog.open(DeletePoolDialogComponent);
        dialogRef.componentInstance.poolId = poolDecorator.id;
    }

    public resizePool(poolDecorator: PoolDecorator) {
        const sidebarRef = this.sidebarManager.open("resize-pool", PoolResizeDialogComponent);
        sidebarRef.component.pool = poolDecorator.pool;
        this.sidebarManager.onClosed.subscribe(() => {
            this.poolService.get(poolDecorator.id);
        });
    }

    public contextmenu(decorator: PoolDecorator) {
        return new ContextMenu([
            new ContextMenuItem({ label: "Delete", click: () => this.deletePool(decorator) }),
            new ContextMenuItem({ label: "Resize", click: () => this.resizePool(decorator) }),
            new ContextMenuItem({
                label: this.pinnedEntityService.isFavorite(decorator.pool) ? "Unpin favorite" : "Pin to favorites",
                click: () => this._pinPool(decorator),
                enabled: true,
            }),
        ]);
    }

    public trackById(index, pool) {
        return pool.id;
    }

    public _pinPool(decorator: PoolDecorator) {
        this.pinnedEntityService.pinFavorite(decorator.pool).subscribe((result) => {
            if (result) {
                this.pinnedEntityService.unPinFavorite(decorator.pool);
            }
        });
    }
}
