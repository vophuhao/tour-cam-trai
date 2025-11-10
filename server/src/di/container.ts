export type Factory<T> = (c: Container) => T;

interface Provider<T> {
  useValue?: T;
  useFactory?: Factory<T>;
  singleton: boolean;
  instance?: T;
}

export class Container {
  private providers = new Map<symbol, Provider<any>>();

  registerValue<T>(token: symbol, value: T) {
    this.providers.set(token, { useValue: value, singleton: true });
  }

  register<T>(token: symbol, factory: Factory<T>, options?: { singleton?: boolean }) {
    this.providers.set(token, {
      useFactory: factory,
      singleton: options?.singleton !== false,
    });
  }

  resolve<T>(token: symbol): T {
    const provider = this.providers.get(token);
    if (!provider) {
      throw new Error(
        `No provider registered for token: ${String(token.description || token.toString())}`
      );
    }

    if (provider.useValue !== undefined) {
      return provider.useValue as T;
    }

    if (!provider.useFactory) {
      throw new Error(`Provider for token ${String(token)} has no factory or value.`);
    }

    if (provider.singleton) {
      if (!provider.instance) {
        provider.instance = provider.useFactory(this);
      }
      return provider.instance as T;
    }

    return provider.useFactory(this) as T;
  }
}
