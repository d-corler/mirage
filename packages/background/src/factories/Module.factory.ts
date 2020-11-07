import { assign, interpret, Interpreter, Machine, StateSchema } from "xstate";
import { Service } from "../index";

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export type Message = {
  service: Service;
  send: any;
};

/*export type Response = {
  service: Service;
  state: ServiceInterpreter['state'];
};*/

export type Response<S extends Service> = {
  service: S;
  state: ServiceInterpreter["state"];
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

export type ServiceEvent =
  | {
      type: "SET_FEATURE";
      feature: keyof ServiceInterpreter["state"]["context"];
      // TODO : improve typing
      value: boolean;
    }
  | {
      type: "ENABLE_FEATURE";
      feature: keyof ServiceInterpreter["state"]["context"];
    }
  | {
      type: "DISABLE_FEATURE";
      feature: keyof ServiceInterpreter["state"]["context"];
    }
  | {
      type: "TOGGLE_FEATURE";
      feature: keyof ServiceInterpreter["state"]["context"];
    };

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
              SET_FEATURE: {
                actions: "processFeature",
              },
              ENABLE_FEATURE: {
                actions: "processFeature",
              },
              DISABLE_FEATURE: {
                actions: "processFeature",
              },
              TOGGLE_FEATURE: {
                actions: "processFeature",
              },
            },
          },
        },
      },
      {
        actions: {
          processFeature: assign((ctx, event) => {
            if (event.type === "SET_FEATURE") {
              return { ...ctx, [event.feature]: event.value };
            } else if (event.type === "ENABLE_FEATURE") {
              return { ...ctx, [event.feature]: true };
            } else if (event.type === "DISABLE_FEATURE") {
              return { ...ctx, [event.feature]: false };
            } else if (event.type === "TOGGLE_FEATURE") {
              return { ...ctx, [event.feature]: !ctx[event.feature] };
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
