export class DownloadDto {
    constructor(
        public id: string,
        public name: string,
        public state: string,
        public seeds: number,
        public leechs: number,
        public downloadSpeed: number,
        public size: number,
        public downloaded: number,
        public progress: number,
        public eta: number,
    ) {
    }
}