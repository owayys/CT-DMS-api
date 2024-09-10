import { Mapper } from "../lib/ddd/mapper.interface";
import { UserEntity } from "../domain/entities/user.entity";
import { UserResponseDto } from "../dtos/user.response.dto";
import { User } from "../lib/validators/userSchemas";
import { z } from "zod";
import { Timestamp } from "../domain/value-objects/timestamp.value-object";
import { UUID } from "../domain/value-objects/uuid.value-object";
import { UserRole } from "../domain/value-objects/user-role.value-object";
import { UserPassword } from "../domain/value-objects/user-password.value-object";

export type UserModel = z.infer<typeof User>;

export class UserMapper
    implements Mapper<UserEntity, UserModel, UserResponseDto>
{
    toPersistence(entity: UserEntity): UserModel {
        const copy = entity.getProps();
        const record: UserModel = {
            Id: copy.id!.toString(),
            createdAt: copy.createdAt.toString(),
            updatedAt: copy.updatedAt.toString(),
            userName: copy.userName,
            userRole: copy.role.toString() as "ADMIN" | "USER",
            password: copy.password.toString(),
        };
        return User.parse(record);
    }

    toDomain(record: UserModel): UserEntity {
        const entity = new UserEntity({
            id: UUID.fromString(record.Id),
            createdAt: Timestamp.fromString(record.createdAt.toString()),
            updatedAt: Timestamp.fromString(record.updatedAt.toString()),
            props: {
                userName: record.userName,
                role: UserRole.fromString(record.userRole),
                password: UserPassword.fromHash(record.password),
            },
        });
        return entity;
    }

    toResponse(entity: UserEntity): UserResponseDto {
        const props = entity.getProps();
        const response = new UserResponseDto({
            Id: props.id!.toString(),
            createdAt: new Date(props.createdAt.toString()),
            updatedAt: new Date(props.updatedAt.toString()),
        });
        response.userName = props.userName;
        return response;
    }
}
