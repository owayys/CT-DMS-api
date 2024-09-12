import { IDrizzleConnection } from "../types";

export class UnitOfWork<T extends IDrizzleConnection> {
    private _operations: any[] = [];

    constructor(private _databaseConnection: T) {}

    public createTransaction(operations: any[]) {
        this._operations = operations;
    }

    async commit(): Promise<any> {
        try {
            this._databaseConnection.transaction(async (tx) => {
                for (const operation of this._operations) {
                    await operation.fn(operation.params, tx);
                }
            });

            return true;
        } catch (err) {
            throw new Error(err.message);
        }
    }
}
