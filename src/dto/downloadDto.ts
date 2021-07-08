export class DownloadDto {
    private id: string = "";
    private name: string = "";
    private percent: number = 0;
    private usersSending: number = 0;
    private totalUsers: number = 0;
    private status: string = "";
    private internalFileName: string = "";
    private priority: string = "";
    private speed: string = "";

    constructor() {
    }
}