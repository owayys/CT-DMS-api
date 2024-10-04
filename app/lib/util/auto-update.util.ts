import { BaseEntity } from "@carbonteq/hexapp";

interface EntityDescriptor extends BaseEntity, PropertyDescriptor {}

export function AutoUpdate() {
    return function (
        target: any,
        propertKey: string,
        descriptor: EntityDescriptor
    ) {
        const method = descriptor.value;

        descriptor.value = function (...args: any[]) {
            const result = method.apply(this, args);
            if (typeof this.markUpdated === "function") {
                this.markUpdated();
            }
            return result;
        };
        return descriptor;
    };
}
