import { z } from "zod";
import { Tag } from "../../lib/validators/document.validators";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { TagEntity } from "../../domain/entities/document/tag.entity";
import { TagResponseDto } from "../../application/dtos/document/tag.response.dto";
import { DateTime } from "@carbonteq/hexapp";

export type TagModel = z.infer<typeof Tag>;

export class TagMapper implements Mapper<TagEntity, TagModel, TagResponseDto> {
    toPersistence(entity: TagEntity): TagModel {
        const copy = entity.serialize();
        const record: TagModel = {
            key: copy.key,
            name: copy.name,
            createdAt: copy.createdAt.toISOString(),
            updatedAt: copy.updatedAt.toISOString(),
        };
        return Tag.parse(record);
    }
    toDomain(record: TagModel): TagEntity {
        return TagEntity.fromSerialized({
            id: "",
            createdAt: DateTime.from(new Date(record.createdAt)),
            updatedAt: DateTime.from(new Date(record.updatedAt)),
            key: record.key,
            name: record.name,
        });
    }
    toResponse(entity: TagEntity): TagResponseDto {
        const props = entity.serialize();
        const response = new TagResponseDto({
            createdAt: new Date(props.createdAt.toISOString()),
            updatedAt: new Date(props.updatedAt.toISOString()),
        });
        response.key = props.key;
        response.name = props.name;
        return response;
    }
}
