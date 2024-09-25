import { z } from "zod";
import { Mapper } from "../../lib/ddd/mapper.interface";
import { Document } from "../../lib/validators/document.validators";
import { DocumentEntity } from "../../domain/entities/document/document.entity";
import { DocumentResponseDto } from "../../application/dtos/document/document.response.dto";
import { DocumentMetadata } from "../../domain/value-objects/document-metadata.value-object";
import { DateTime } from "@carbonteq/hexapp";

export type DocumentModel = z.infer<typeof Document>;

export class DocumentMapper
    implements Mapper<DocumentEntity, DocumentModel, DocumentResponseDto>
{
    toPersistence(entity: DocumentEntity): DocumentModel {
        const copy = entity.serialize();
        const record: DocumentModel = {
            userId: copy.ownerId,
            Id: copy.id,
            createdAt: copy.createdAt.toISOString(),
            updatedAt: copy.updatedAt.toISOString(),
            fileName: copy.fileName,
            fileExtension: copy.fileExtension,
            contentType: copy.contentType,
            content: copy.content,
            meta: copy.meta?.value,
            tags: copy.tags.map((t) => {
                return { key: t.key, name: t.name };
            }),
        };
        return Document.parse(record);
    }

    toDomain(record: DocumentModel): DocumentEntity {
        return DocumentEntity.fromSerialized({
            id: record.Id,
            createdAt: DateTime.from(new Date(record.createdAt)),
            updatedAt: DateTime.from(new Date(record.updatedAt)),
            ownerId: record.userId,
            fileName: record.fileName,
            fileExtension: record.fileExtension,
            contentType: record.contentType,
            content: record.content,
            meta: record.meta
                ? DocumentMetadata.fromData(record.meta)
                : undefined,
            tags: record.tags,
        });
    }

    toResponse(entity: DocumentEntity): DocumentResponseDto {
        const props = entity.serialize();
        const response = new DocumentResponseDto({
            Id: props.id!.toString(),
            createdAt: new Date(props.createdAt.toISOString()),
            updatedAt: new Date(props.updatedAt.toISOString()),
        });
        response.userId = props.ownerId.toString();
        response.fileName = props.fileName;
        response.fileExtension = props.fileExtension;
        response.contentType = props.contentType;
        response.content = props.content;
        if (props.meta) response.meta = props.meta.value;
        response.tags = props.tags.map((t) => {
            return {
                key: t.key,
                name: t.name,
            };
        });
        return response;
    }
}
