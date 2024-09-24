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

// export function AutoUpdate(
//     target: Function,
//     propertKey: string,
//     // descriptor: PropertyDescriptor
//     value: any
// ) {
//     return (...args: any[]) => {
//         const result = target.apply(value, args);
//         if (typeof value.onUpdate === "function") {
//             console.log("UPDATE");
//             value.onUpdate();
//         }
//         return result;
//     };
// }
