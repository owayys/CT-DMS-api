import { UserDefinedMetadata } from "../../domain/types/document.types";

type filterBy = {
    tags?: {
        key: string;
        name: string;
    };
    meta?: UserDefinedMetadata;
};

export function filterByCriteria<T>(data: T[], criteria: filterBy) {
    const matchesCriteria = (
        item: T,
        criteria: UserDefinedMetadata
    ): boolean => {
        return Object.keys(criteria).every((key) => {
            const value = criteria[key];

            if (typeof value === "object" && !Array.isArray(value)) {
                return matchesCriteria(item[key as keyof T] as T, value);
            }

            if (Array.isArray(value)) {
                const itemValue = item[key as keyof T] as T;

                if (!Array.isArray(itemValue)) {
                    return false;
                }

                return value.some((v) => {
                    if (typeof v === "object") {
                        return itemValue.some((innerItem) => {
                            return matchesCriteria(innerItem, v);
                        });
                    }
                    return itemValue.includes(v);
                });
            }

            if (item) {
                return (item[key as keyof T] as T) === value;
            } else {
                return false;
            }
        });
    };

    return data.filter((item) => matchesCriteria(item, criteria));
}
