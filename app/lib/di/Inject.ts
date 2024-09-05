import { INJECTION_KEY } from "./di.tokens";

interface Injection {
    index: number;
    key: symbol;
}

export function Inject(key: symbol) {
    return function (
        target: Object,
        propertyKey: string | symbol | any,
        parameterIndex: number
    ) {
        const existingInjections: Injection[] =
            Reflect.getOwnMetadata(INJECTION_KEY, target) || [];
        existingInjections.push({ index: parameterIndex, key });
        Reflect.defineMetadata(INJECTION_KEY, existingInjections, target);
    };
}
