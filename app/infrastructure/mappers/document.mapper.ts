import { z } from "zod";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { Document } from "../../lib/validators/document.validators";
import { DocumentEntity } from "../../domain/entities/document.entity";
import { DocumentResponseDto } from "../../application/dtos/document.response.dto";
import { UUID } from "../../domain/value-objects/uuid.value-object";
import { Timestamp } from "../../domain/value-objects/timestamp.value-object";
import { TagEntity } from "../../domain/entities/tag.entity";
import { DocumentMetadata } from "../../domain/value-objects/document-metadata.value-object";

export type DocumentModel = z.infer<typeof Document>;

export class DocumentMapper
    implements Mapper<DocumentEntity, DocumentModel, DocumentResponseDto>
{
    toPersistence(entity: DocumentEntity): DocumentModel {
        const copy = entity.getProps();
        const record: DocumentModel = {
            userId: copy.userId.toString(),
            Id: copy.id!.toString(),
            createdAt: copy.createdAt.toString(),
            updatedAt: copy.updatedAt.toString(),
            fileName: copy.fileName,
            fileExtension: copy.fileExtension,
            contentType: copy.contentType,
            content: copy.content,
            meta: copy.meta?.val,
            tags: copy.tags.map((t) => {
                return { key: t.key, name: t.name };
            }),
        };
        return Document.parse(record);
    }

    toDomain(record: DocumentModel): DocumentEntity {
        const entity = new DocumentEntity({
            id: UUID.fromString(record.Id),
            createdAt: Timestamp.fromString(record.createdAt),
            updatedAt: Timestamp.fromString(record.updatedAt),
            props: {
                userId: UUID.fromString(record.userId),
                fileName: record.fileName,
                fileExtension: record.fileExtension,
                contentType: record.contentType,
                content: record.content,
                meta: DocumentMetadata.fromData(record.meta),
                tags: record.tags.map((t) => {
                    return TagEntity.create({ key: t.key, name: t.name });
                }),
            },
        });
        return entity;
    }

    toResponse(entity: DocumentEntity): DocumentResponseDto {
        const props = entity.getProps();
        const response = new DocumentResponseDto({
            Id: props.id!.toString(),
            createdAt: new Date(props.createdAt.toString()),
            updatedAt: new Date(props.updatedAt.toString()),
        });
        response.userId = props.userId.toString();
        response.fileName = props.fileName;
        response.fileExtension = props.fileExtension;
        response.contentType = props.contentType;
        response.content = props.content;
        if (props.meta) response.meta = props.meta.val;
        response.tags = props.tags.map((t) => {
            return {
                key: t.key,
                name: t.name,
            };
        });
        return response;
    }
}
