import { TagEntity } from "../entities/tag.entity";

export type TagCollectionProps = {
    tags: Map<string, TagEntity>;
};

export type CreateTagCollectionProps = {
    tags: {
        key: string;
        name: string;
    }[];
};
