import { Result } from "../util/result";

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
    insert(entity: Entity | Entity[]): Promise<Result<Entity, Error>>;
    findOneById(id: string): Promise<Result<Entity, Error>>;
    findAll(): Promise<Result<Entity[], Error>>;
    findAllPaginated(
        params: PaginatedQueryParams
    ): Promise<Result<Paginated<Entity>, Error>>;
    update(entity: Entity): Promise<Result<boolean, Error>>;
    delete(entity: Entity): Promise<Result<boolean, Error>>;
}
