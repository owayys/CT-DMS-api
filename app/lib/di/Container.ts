import { FgCyan, FgYellow } from "../colors";

export class Container {
    private static registry: Map<symbol, any> = new Map();

    static register(key: symbol, instance: any) {
        if (!Container.registry.has(key)) {
            Container.registry.set(key, instance);
            console.log(
                `${FgCyan}[DI]: Added ${FgYellow}${key.description}${FgCyan} to the registry`
            );
        }
    }

    static get(key: symbol) {
        return Container.registry.get(key);
    }
}
