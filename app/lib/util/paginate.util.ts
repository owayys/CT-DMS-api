import { Paginated, PaginationOptions } from "@carbonteq/hexapp";

export function paginate<T>(
    items: T[],
    params: PaginationOptions
): Paginated<T> {
    let totalPages = Math.ceil(items.length / params.pageSize);
    let page = Math.min(totalPages, params.pageNum);
    let itemsSliced = items.slice(
        (page - 1) * params.pageSize,
        (page - 1) * params.pageSize + params.pageSize
    );

    let size = Math.min(itemsSliced.length, params.pageSize);

    return {
        pageNum: page,
        pageSize: size,
        totalPages: totalPages,
        data: itemsSliced,
    };
}
