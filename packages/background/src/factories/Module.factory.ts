import { assign, interpret, Interpreter, Machine, StateSchema } from "xstate";
import { Service } from "../index";

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export type Message = {
  service: Service;
  send: any;
};

export type ServiceContext = {
  feature_1: boolean;
};

export interface ServiceSchema extends StateSchema {
  states: {
    init: Record<string, unknown>;
    disabled: Record<string, unknown>;
    enabled: Record<string, unknown>;
  };
}

export type ServiceEvent = { type: "ENABLE_FEATURE"; feature: string };

type ServiceInterpreter = Interpreter<
  ServiceContext,
  ServiceSchema,
  ServiceEvent
>;

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export default abstract class ModuleFactory {
  private readonly _name;
  private readonly _interpreter: ServiceInterpreter;

  protected constructor(name: string) {
    this._name = name;

    const machine = this.createMachine();

    this._interpreter = interpret(machine).start();

    console.log(`📦 Service "${this._name}" ready`);
  }

  protected createMachine() {
    return Machine<ServiceContext, ServiceSchema, ServiceEvent>(
      {
        id: this._name,
        context: {
          feature_1: false,
        },
        initial: "enabled",
        states: {
          init: {},
          disabled: {},
          enabled: {
            on: {
              ENABLE_FEATURE: {
                actions: "enableFeature",
              },
            },
          },
        },
      },
      {
        actions: {
          enableFeature: assign((ctx, event) => {
            if (event.type === "ENABLE_FEATURE") {
              return { ...ctx, [event.feature]: true };
            }
            return { ...ctx };
          }),
        },
      }
    );
  }

  public get interpreter() {
    return this._interpreter;
  }
}
