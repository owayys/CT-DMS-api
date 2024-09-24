import { AppError, AppResult } from "@carbonteq/hexapp";
import { DocumentEntity } from "../entities/document/document.entity";
import { AuthorizeDocumentAccessCommand } from "../types/document.types";

export class AuthorizeDocumentAccessService {
    async execute(
        command: AuthorizeDocumentAccessCommand
    ): Promise<AppResult<DocumentEntity>> {
        const authorized = command.document.ownerId === command.userId;

        return authorized
            ? AppResult.Ok(command.document)
            : AppResult.Err(
                  AppError.Unauthorized(
                      `User [${
                          command.userId
                      }] not authorized to access document [${command.document.id!.toString()}]`
                  )
              );
    }
}
