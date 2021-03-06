import { Component } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef } from "@angular/material";
import { List } from "immutable";
import * as path from "path";
import { AsyncSubject, Observable } from "rxjs";

import { BackgroundTask, BackgroundTaskService } from "app/components/base/background-task";
import { NotificationService } from "app/components/base/notifications";
import { autobind } from "app/core";
import { ElectronShell, FileSystemService, StorageService } from "app/services";
import { SecureUtils } from "app/utils";
import * as minimatch from "minimatch";
import "./download-file-group-dialog.scss";

@Component({
    selector: "bl-download-file-group-dialog",
    templateUrl: "download-file-group-dialog.html",
})
export class DownloadFileGroupDialogComponent {
    public set containerId(containerId: string) {
        this._containerId = containerId;
        this.downloadFolder.setValue(this._defaultDownloadFolder);
    }
    public get containerId() { return this._containerId; }

    public patterns = new FormControl("**/*");
    public downloadFolder = new FormControl("");
    public subfolder: string = "";
    public pathPrefix: string = "";

    private _containerId: string;

    constructor(
        public dialogRef: MatDialogRef<DownloadFileGroupDialogComponent>,
        private storageService: StorageService,
        private backgroundTaskService: BackgroundTaskService,
        private fs: FileSystemService,
        private shell: ElectronShell,
        private notificationService: NotificationService,
    ) { }

    @autobind()
    public startDownload() {
        this._startDownloadAsync();
        return Observable.of({});
    }

    public updateDownloadFolder(folder: string) {
        this.downloadFolder.setValue(folder);
    }

    private async _startDownloadAsync() {
        const folder = await this._getDownloadFolder();

        this.backgroundTaskService.startTask(`Download ${this.pathPrefix}`, (task: BackgroundTask) => {
            const subject = new AsyncSubject();
            task.progress.next(1);
            this._getListOfFilesToDownload().subscribe((files) => {
                if (files.size === 0) {
                    this.notificationService.warn(
                        "Pattern not found",
                        `Failed to find pattern: ${this._getPatterns()}`,
                    );
                    task.progress.next(100);
                    subject.complete();
                } else {
                    task.progress.next(10);
                    const downloadObs = this._downloadFiles(task, folder, files);
                    Observable.forkJoin(downloadObs).subscribe(() => {
                        this.shell.showItemInFolder(folder);
                        task.progress.next(100);
                        subject.complete();
                    });
                }
            });

            return subject.asObservable();
        });
    }

    private _getPatterns(): string[] {
        return this.patterns.value.split("\n");
    }

    private _getDownloadFolder(): Promise<string> {
        // Gets current selected folder by joining base download folder and selected directory name
        // Ensures that this selected directory is unique under base download folder
        const folder = path.join(this.downloadFolder.value, this.subfolder);
        return this.fs.exists(folder).then((exists) => {
            if (exists) {
                return `${folder}_${SecureUtils.uuid()}`;
            } else {
                return folder;
            }
        });
    }

    private _downloadFiles(task: BackgroundTask, folder: string, files: List<File>): Array<Observable<any>> {
        const progressStep = 90 / files.size;
        return files.map((file) => {
            const fileLoader = this.storageService.getBlobContent(this.containerId, file.name);
            const fileName = this._getSubdirectoryPath(file.name);
            const filePath = path.join(folder, fileName);
            return fileLoader.download(filePath).do(() => {
                task.progress.next(task.progress.value + progressStep);
            });
        }).toArray();
    }

    private _getListOfFilesToDownload(): Observable<List<File>> {
        const patterns = this._getPatterns();
        const data = this.storageService.blobListView(this.containerId, { recursive: true });
        return data.fetchAll().flatMap(() => data.items.take(1)).map((items) => {
            data.dispose();
            const files = items.filter((file) => {
                // Filter files that are not part of this directory
                if (!file.name.startsWith(this.pathPrefix)) {
                    return false;
                }
                for (const pattern of patterns) {
                    // Path prefix must be excluded when compared to pattern
                    const fileName = this._getSubdirectoryPath(file.name);
                    if (minimatch(fileName, pattern)) {
                        return true;
                    }
                }
                return false;
            });
            return List(files);
        });
    }

    private get _defaultDownloadFolder() {
        return path.join(this.fs.commonFolders.downloads, "batch-labs");
    }

    private _getSubdirectoryPath(filePath: string) {
        return filePath.slice(this.pathPrefix.length);
    }
}
