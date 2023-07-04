export interface IMoviesResponse {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    data: IMovie[];
}

export interface IMovie {
    Title: string;
    Year: number;
    imdbID: string;
}