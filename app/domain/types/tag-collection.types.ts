import { TagEntity } from "../entities/document/tag.entity";

export type TagCollectionProps = {
    tags: Map<string, TagEntity>;
};

export type CreateTagCollectionProps = {
    tags: {
        key: string;
        name: string;
    }[];
};
