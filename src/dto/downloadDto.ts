export class DownloadDto {
    constructor(
        public id: string,
        public name: string,
        public percent: number,
        public usersSending: number,
        public usersAvailable: number,
        public usersTotal: number,
        public status: string,
        public internalFileName: string,
        public priority: string,
        public speed: number
    ) {
    }
}