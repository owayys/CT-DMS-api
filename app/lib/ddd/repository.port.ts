import { AppResult } from "@carbonteq/hexapp";
// import { Result } from "../util/result";

export class Paginated<T> {
    readonly page: number;
    readonly size: number;
    readonly totalPages: number;
    readonly totalItems: number;
    items: T[];

    constructor(props: Paginated<T>) {
        this.page = props.page;
        this.size = props.size;
        this.totalPages = props.totalPages;
        this.totalItems = props.totalItems;
        this.items = props.items;
    }
}

export type OrderBy = { field: string | true; param: "asc" | "desc" };

export type PaginatedQueryParams = {
    pageSize: number;
    pageNumber: number;
    orderBy: OrderBy;
};

export interface RepositoryPort<Entity> {
    insert(entity: Entity | Entity[]): Promise<AppResult<Entity>>;
    findOneById(id: string): Promise<AppResult<Entity>>;
    findAll(): Promise<AppResult<Entity[]>>;
    findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<AppResult<Paginated<Entity>>>;
    update(entity: Entity): Promise<AppResult<boolean>>;
    delete(entity: Entity): Promise<AppResult<boolean>>;
}
