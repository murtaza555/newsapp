interface App {
    name: string
}

declare var app: App;
declare var main: HTMLDivElement;
declare var loader: HTMLDivElement;
declare var toastContainer: HTMLDivElement;
declare function cookies(): Object<string, string>;
declare function setLocation(href: string): void;