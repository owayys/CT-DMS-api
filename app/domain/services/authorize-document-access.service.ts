import { Result } from "../../lib/util/result";
import { DocumentEntity } from "../entities/document.entity";
import { AuthorizeDocumentAccessCommand } from "../types/document.types";

export class AuthorizeDocumentAccessService {
    async execute(
        command: AuthorizeDocumentAccessCommand
    ): Promise<Result<DocumentEntity, Error>> {
        const authorized = command.document.owner.equals(command.userId);

        return authorized
            ? new Result<DocumentEntity, Error>(command.document, null)
            : new Result<DocumentEntity, Error>(
                  null,
                  new Error(
                      `User [${
                          command.userId
                      }] not authorized to access document [${command.document.id!.toString()}]`
                  )
              );
    }
}
