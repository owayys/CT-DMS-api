import { z } from "zod";
import { Tag } from "../../lib/validators/document.validators";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { TagEntity } from "../../domain/entities/tag.entity";
import { TagResponseDto } from "../dtos/tag.response.dto";
import { Timestamp } from "../../domain/value-objects/timestamp.value-object";

export type TagModel = z.infer<typeof Tag>;

export class TagMapper implements Mapper<TagEntity, TagModel, TagResponseDto> {
    toPersistence(entity: TagEntity): TagModel {
        const copy = entity.getProps();
        const record: TagModel = {
            key: copy.key,
            name: copy.name,
            createdAt: copy.createdAt.toString(),
            updatedAt: copy.updatedAt.toString(),
        };
        return Tag.parse(record);
    }
    toDomain(record: any): TagEntity {
        const entity = new TagEntity({
            createdAt: Timestamp.fromString(record.createdAt.toString()),
            updatedAt: Timestamp.fromString(record.updatedAt.toString()),
            props: {
                key: record.key,
                name: record.name,
            },
        });
        return entity;
    }
    toResponse(entity: TagEntity): TagResponseDto {
        const props = entity.getProps();
        const response = new TagResponseDto({
            Id: props.id!.toString(),
            createdAt: new Date(props.createdAt.toString()),
            updatedAt: new Date(props.updatedAt.toString()),
        });
        response.key = props.key;
        response.name = props.name;
        return response;
    }
}
