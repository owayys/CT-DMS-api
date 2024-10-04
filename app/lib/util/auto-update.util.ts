import { BaseEntity } from "@carbonteq/hexapp";

export function AutoUpdate() {
    return function (
        target: any,
        propertKey: string,
        descriptor: PropertyDescriptor
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
