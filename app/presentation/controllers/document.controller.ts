import { UploadedFile } from "express-fileupload";
import path from "path";
import { Inject } from "../../lib/di/Inject";
import { DOCUMENT_SERVICE, LOGGER } from "../../lib/di/di.tokens";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { ILogger } from "../../lib/logging/ILogger";
import { ArgumentNotProvidedException } from "../../lib/exceptions/exceptions";
import { Services } from "../../application/services/types";
import { AppResult } from "@carbonteq/hexapp";
import { GetDocumentRequestDto } from "../../application/dtos/document/get-document.request.dto";
import { GetAllDocumentsRequestDto } from "../../application/dtos/document/get-all-documents.request.dto";
import { CreateDocumentRequestDto } from "../../application/dtos/document/create-document.request.dto";
import { UserDefinedMetadata } from "../../domain/types/document.types";
import { UpdateDocumentRequestDto } from "../../application/dtos/document/update-document.request.dto";
import { GetDocumentContentRequestDto } from "../../application/dtos/document/get-document-content.request.dto";
import { DeleteDocumentRequestDto } from "../../application/dtos/document/delete-document.request.dto";
import { AddTagRequestDto } from "../../application/dtos/document/add-tag.request.dto";
import { UpdateTagRequestDto } from "../../application/dtos/document/update-tag.request.dto";
import { DeleteTagRequestDto } from "../../application/dtos/document/delete-tag.request.dto";
import { UpdateMetaRequestDto } from "../../application/dtos/document/update-meta.request.dto";
import { DeleteMetaRequestDto } from "../../application/dtos/document/delete-meta.request.dto";
import { retry } from "../../lib/resilience/policies";
import { AppContext, MiddlewareFunc } from "../middleware/types.middleware";
import { DocumentResponseDto } from "../../application/dtos/document/document.response.dto";

const RETRY_ATTEMPTS = 3;

@InjectionTarget()
export class DocumentController {
    constructor(
        @Inject(DOCUMENT_SERVICE)
        private documentService: Services[typeof DOCUMENT_SERVICE],
        @Inject(LOGGER) private logger: ILogger
    ) {}

    get: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext<DocumentResponseDto>> => {
        const userId = context.user.Id;
        const command: GetDocumentRequestDto = context.body;
        const { id } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, async () =>
            this.documentService.get(userId, id)
        );

        context.result = result;

        return context;
    };

    getAll: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext<DocumentResponseDto>> => {
        const command: GetAllDocumentsRequestDto = context.body;
        const { pageNumber, pageSize, filterBy } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.getAll(pageNumber, pageSize, filterBy)
        );

        context.result = result;

        return context;
    };

    getContent: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: GetDocumentContentRequestDto = context.body;
        const { id } = command;
        const userId = context.user.Id;
        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.getContent(userId, id)
        );

        context.result = result;

        return context;
    };

    save: MiddlewareFunc = async (context: AppContext): Promise<AppContext> => {
        const command: CreateDocumentRequestDto = context.body;
        const { fileName, fileExtension, contentType, tags, content, meta } =
            command;
        const userId = context.user.Id;

        const result = await this.documentService.save(
            userId,
            fileName,
            fileExtension,
            contentType,
            tags,
            content,
            meta as UserDefinedMetadata
        );

        context.result = result;

        return context;
    };

    upload: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        if (!context.body || Object.keys(context.body).length === 0) {
            context.result = AppResult.Err(
                new ArgumentNotProvidedException("No file uploaded")
            );
            return context;
        } else {
            const {
                tags,
                file,
            }: { tags: { key: string; name: string }[]; file: UploadedFile } =
                context.body;

            const fileName = path.parse(file.name).name;
            const fileExtension = path.parse(file.name).ext;

            const contentType = file.mimetype;

            const userId = context.user.Id;

            const result = await this.documentService.upload(
                userId,
                file,
                fileName,
                fileExtension,
                contentType,
                tags
            );

            context.result = result;

            return context;
        }
    };

    download: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const { url } = context.params!;

        const result = await this.documentService.download(url as string);

        context.result = result;

        return context;
    };

    update: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: UpdateDocumentRequestDto = context.body;
        const { fileName, fileExtension, contentType, tags, content } = command;
        const { id } = context.params!;
        const userId = context.user.Id;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.update(
                userId,
                id,
                fileName,
                fileExtension,
                contentType,
                tags,
                content
            )
        );

        context.result = result;

        return context;
    };

    remove: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: DeleteDocumentRequestDto = context.body;
        const { id } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.remove(id)
        );

        context.result = result;

        return context;
    };

    addTag: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: AddTagRequestDto = context.body;
        const { id, tag } = command;

        const result = await this.documentService.addTag(id, tag);

        context.result = result;

        return context;
    };

    updateTag: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: UpdateTagRequestDto = context.body;
        const { id, tag } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.updateTag(id, tag)
        );

        context.result = result;

        return context;
    };

    removeTag: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: DeleteTagRequestDto = context.body;
        const { id, tag } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.removeTag(id, tag)
        );

        context.result = result;

        return context;
    };

    updateMeta: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: UpdateMetaRequestDto = context.body;
        const { id, meta } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.updateMeta(id, meta)
        );

        context.result = result;

        return context;
    };

    deleteMeta: MiddlewareFunc = async (
        context: AppContext
    ): Promise<AppContext> => {
        const command: DeleteMetaRequestDto = context.body;
        const { id } = command;

        const result = await retry({ attempts: RETRY_ATTEMPTS }, () =>
            this.documentService.deleteMeta(id)
        );

        context.result = result;

        return context;
    };
}
