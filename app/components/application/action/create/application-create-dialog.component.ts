import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Response } from "@angular/http";
import * as storage from "azure-storage";
import { Observable } from "rxjs";

import { NotificationService } from "app/components/base/notifications";
import { SidebarRef } from "app/components/base/sidebar";
import { autobind } from "app/core";
import { BatchApplication } from "app/models";
import { applicationToCreateFormModel } from "app/models/forms";
import { ApplicationService, StorageService } from "app/services";
import { Constants, log, prettyBytes } from "app/utils";

@Component({
    selector: "bl-application-create-dialog",
    templateUrl: "application-create-dialog.html",
})
export class ApplicationCreateDialogComponent {
    public file: File;
    public form: FormGroup;
    public blockCount: number = 0;
    public progress: string;
    public title: string = "Create application package";
    public description: string = "Upload an application package and give it an identifier to create your application";

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<ApplicationCreateDialogComponent>,
        private applicationService: ApplicationService,
        private storageService: StorageService,
        private notificationService: NotificationService) {

        const validation = Constants.forms.validation;
        this.form = this.formBuilder.group({
            id: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.applicationName),
                Validators.pattern(validation.regex.id),
            ]],
            version: ["", [
                Validators.required,
                Validators.maxLength(validation.maxLength.version),
                Validators.pattern(validation.regex.appVersion),
            ]],
            package: ["", [
                Validators.required,
                Validators.pattern(validation.regex.appFilename),
            ]],
        });
    }

    public setValue(application: BatchApplication, version?: string) {
        // TODO: need to disable appId and version fields if they are supplied
        this.form.patchValue(applicationToCreateFormModel(application, version));
        if (version) {
            this.title = "Update selected package";
            this.description = "Select a new package to overwrite the existing version";
        } else {
            this.description = "Upload a new package version for the selected application";
        }
    }

    public fileSelected(changeEvent: Event) {
        const element = changeEvent.srcElement as any;
        this.form.controls["package"].markAsTouched();

        if (element.files.length > 0) {
            this.file = element.files[0];
            this.form.controls["package"].setValue(this.file.name);
        } else {
            this.file = null;
            this.form.controls["package"].setValue(null);
        }
    }

    public hasValidFile(): boolean {
        return this.file && this.form.controls["package"].valid;
    }

    public prettyFileSize(size: number) {
        return prettyBytes(size);
    }

    @autobind()
    public submit(): Observable<any> {
        const formData = this.form.value;

        return this.applicationService.put(formData.id, formData.version)
            .cascade((packageVersion) => this._uploadAppPackage(this.file, packageVersion.storageUrl))
            .cascade(() => {
                return this.applicationService.activatePackage(formData.id, formData.version).subscribe({
                    next: () => {
                        this.applicationService.onApplicationAdded.next(formData.id);
                        this.notificationService.success(
                            "Application added!",
                            `Version ${formData.version} for application '${formData.id}' was successfully created!`,
                        );
                    },
                    error: (response: Response) => {
                        /**
                         * Possible errors
                         *  - trying to put a package that already exists and has allowUpdates = false
                         *      409 (The settings for the specified application forbid package updates.)
                         *      code : "ApplicationDoesntAllowPackageUpdates"
                         *      message :
                         *          "The settings for the specified application forbid package updates."
                         *          RequestId: 0427d452-dbfe-48ff-80f9-680a26bbff27
                         *          Time:2017-02-13T03:35:27.0685745Z
                         */
                        log.error("Failed to activate application package :: ", response);
                        this.notificationService.error(
                            "Activation failed",
                            "The application package was uploaded into storage successfully, "
                            + "but the activation process failed.",
                        );
                    },
                });
            });
    }

    private _uploadAppPackage(file: File, sasUrl: string): Observable<storage.BlobService.BlobResult> {
        if (!this.hasValidFile()) {
            return Observable.throw("Valid file not selected");
        }
        return this.storageService.uploadToSasUrl(sasUrl, file.path);
    }
}
