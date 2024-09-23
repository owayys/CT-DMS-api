import { BaseEntity } from "@carbonteq/hexapp";
export interface Mapper<
    DomainEntity extends BaseEntity,
    DbRecord,
    Response = any
> {
    toPersistence(entity: DomainEntity): DbRecord;
    toDomain(record: DbRecord): DomainEntity;
    toResponse(entity: DomainEntity): Response;
}
