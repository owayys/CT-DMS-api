import { AppResult } from "@carbonteq/hexapp";
import { ArgumentInvalidException } from "../../lib/exceptions/exceptions";
import { DocumentEntity } from "../entities/document.entity";
import { AuthorizeDocumentAccessCommand } from "../types/document.types";

export class AuthorizeDocumentAccessService {
    async execute(
        command: AuthorizeDocumentAccessCommand
    ): Promise<AppResult<DocumentEntity>> {
        const authorized = command.document.ownerId === command.userId;

        return authorized
            ? AppResult.Ok(command.document)
            : AppResult.Err(
                  new ArgumentInvalidException(
                      `User [${
                          command.userId
                      }] not authorized to access document [${command.document.id!.toString()}]`
                  )
              );
    }
}
