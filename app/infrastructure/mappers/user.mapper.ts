import { Mapper } from "../../lib/ddd/mapper.interface";
import { UserEntity } from "../../domain/entities/user/user.entity";
import { UserResponseDto } from "../../application/dtos/user/user.response.dto";
import { User } from "../../lib/validators/user.validators";
import { z } from "zod";
import { UserRole } from "../../domain/value-objects/user-role.value-object";
import { UserPassword } from "../../domain/value-objects/user-password.value-object";
import { DateTime } from "@carbonteq/hexapp";

export type UserModel = z.infer<typeof User>;

export class UserMapper
    implements Mapper<UserEntity, UserModel, UserResponseDto>
{
    toPersistence(entity: UserEntity): UserModel {
        const copy = entity.serialize();
        const record: UserModel = {
            Id: copy.id!.toString(),
            createdAt: copy.createdAt.toISOString(),
            updatedAt: copy.updatedAt.toISOString(),
            userName: copy.userName,
            userRole: copy.role.toString() as "ADMIN" | "USER",
            password: copy.password.toString(),
        };
        return User.parse(record);
    }

    toDomain(record: UserModel): UserEntity {
        return UserEntity.fromSerialized({
            id: record.Id,
            createdAt: DateTime.from(new Date(record.createdAt)),
            updatedAt: DateTime.from(new Date(record.updatedAt)),
            userName: record.userName,
            role: UserRole.fromString(record.userRole),
            password: UserPassword.fromHash(record.password),
        });
    }

    toResponse(entity: UserEntity): UserResponseDto {
        const props = entity.serialize();
        const response = new UserResponseDto({
            Id: props.id,
            createdAt: new Date(props.createdAt.toISOString()),
            updatedAt: new Date(props.updatedAt.toISOString()),
        });
        response.userName = props.userName;
        return response;
    }
}
