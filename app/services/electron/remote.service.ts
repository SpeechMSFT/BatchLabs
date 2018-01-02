import { Injectable } from "@angular/core";
import { BatchLabsApplication, FileSystem, LocalFileStorage } from "client/core";
import { AuthenticationWindow } from "client/core/aad";
import { SplashScreen } from "client/splash-screen";
import { remote } from "electron";

/**
 * Injectable service wrapping electron shell.
 * This makes it easier to mock the electron shell.
 */
@Injectable()
export class ElectronRemote {

    public get dialog(): Electron.Dialog {
        return remote.dialog;
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getBatchLabsApp(): BatchLabsApplication {
        return this._currentWindow().batchLabsApp;
    }

    /**
     * @returns The BrowserWindow object which this web page belongs to.
     */
    public getCurrentWindow(): Electron.BrowserWindow {
        return remote.getCurrentWindow();
    }

    public getSplashScreen(): SplashScreen {
        return this._currentWindow().splashScreen;
    }

    public getAuthenticationWindow(): AuthenticationWindow {
        return this._currentWindow().authenticationWindow;
    }

    public getFileSystem(): FileSystem {
        return this._currentWindow().fs;
    }

    public getLocalFileStorage(): LocalFileStorage {
        return this._currentWindow().localFileStorage;
    }

    private _currentWindow(): any {
        return remote.getCurrentWindow();
    }
}
