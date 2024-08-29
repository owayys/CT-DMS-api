export interface IUserRepository {
    findById(userId: string): Promise<any>;

    findByName(userName: string): Promise<any>;

    all(pageNumber: number, pageSize: number): Promise<any>;

    save(userName: string, passwordHash: string): Promise<any>;

    update(userId: string, password: string): Promise<any>;
}
