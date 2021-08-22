export class SearchItemDto {
    constructor(
        public downloadIndex: number,
        public name: string,
        public size: string,
        public sources: number
    ) {
    }
}