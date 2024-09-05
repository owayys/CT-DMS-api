import { FgCyan, FgYellow } from "../colors";
import { INJECTION_KEY } from "./di.tokens";
import { Container } from "./Container";

interface Injection {
    index: number;
    key: symbol;
}

type Constructor<T = any> = new (...args: any[]) => T;

export function InjectionTarget() {
    return function injectionTarget<T extends { new (...args: any[]): {} }>(
        constructor: T
    ): T {
        return class extends constructor {
            constructor(...args: any[]) {
                const injections: Injection[] =
                    Reflect.getMetadata(INJECTION_KEY, constructor) || [];
                const injectedArgs = injections
                    .sort((a, b) => a.index - b.index)
                    .map(({ key }) => {
                        console.log(
                            `${FgCyan}[DI]: Injecting ${FgYellow}${key.description}${FgCyan} into ${FgYellow}${constructor.name}`
                        );

                        return new (Container.get(key) as Constructor)();
                    });
                super(...injectedArgs);
            }
        };
    };
}
