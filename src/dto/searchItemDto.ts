export class SearchItemDto {
    constructor(
        public title: string,
        public link: string,
        public size: number,
        public seeders: number,
        public peers: number,
        public tracker: string,
    ) {
    }
}