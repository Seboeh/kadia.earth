"use client";
import React, { createContext, useContext, useReducer } from "react";
import {Project} from "@/lib/openapi/generated";

type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

function createEntityReducer<T extends object>() {
    type Action =
        | { type: "SET"; payload: T }
        | { type: "UPDATE"; payload: DeepPartial<T> }
        | { type: "RESET" };

    function reducer(state: T | null, action: Action): T | null {
        console.log("%c[Reducer]", "color: #0bf", { action, prev: state });
        switch (action.type) {
            case "SET":
                return action.payload;
            case "UPDATE":
                return state ? { ...state, ...action.payload } : state;
            case "RESET":
                return null;
            default:
                return state;
        }
    }

    return reducer;
}

type EntityContextType<T> = {
    entity: T | null;
    dispatch: React.Dispatch<any>;
};

function createEntityContext<T extends object>() {
    const Context = createContext<EntityContextType<T>>({
        entity: null,
        dispatch: () => {},
    });

    const reducer = createEntityReducer<T>();

    const Provider = ({
                          children,
                          initialEntity,
                      }: {
        children: React.ReactNode;
        initialEntity?: T;
    }) => {
        const [entity, dispatch] = useReducer(reducer, initialEntity ?? null);
        return (
            <Context.Provider value={{ entity, dispatch }}>{children}</Context.Provider>
        );
    };

    const useEntity = () => useContext(Context);

    const useEntityActions = () => {
        const { dispatch } = useContext(Context);
        return {
            set: (data: T) => dispatch({ type: "SET", payload: data }),
            update: (data: DeepPartial<T>) => dispatch({ type: "UPDATE", payload: data }),
            reset: () => dispatch({ type: "RESET" }),
        };
    };

    return { Provider, useEntity, useEntityActions };
}

// 🧩 --- Für dein Projekt ---
export const {
    Provider: ProjectProvider,
    useEntity: useProject,
    useEntityActions: useProjectActions,
} = createEntityContext<Project>();
