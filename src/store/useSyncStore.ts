import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import { clone } from "radash";

type SyncStep = "step1" | "step2" | "step3";
type SyncTask = Record<SyncStep, unknown>;

type SyncActions = {
    setSyncTask: (step: SyncStep, data: unknown) => void;
    clearSyncTask: (step: SyncStep | "all") => void;
    fetchInitialData: () => Promise<void>;
};

type SyncStore = {
    syncTask: SyncTask;
    actions: SyncActions;
};

const initialSyncTask = {
    step1: {},
    step2: {},
    step3: {},
} satisfies SyncTask;

export const useSyncStore = create<SyncStore>()(
    persist(
        immer((set) => ({
            // --- 1. 纯变量区域 (State) ---
            syncTask: clone(initialSyncTask),

            // --- 2. Actions 对象区域 ---
            actions: {
                setSyncTask: (step, data) =>
                    set((state) => {
                        state.syncTask[step] = data;
                    }),

                clearSyncTask: (step) =>
                    set((state) => {
                        if (step === "all") {
                            state.syncTask = clone(initialSyncTask);
                        } else {
                            state.syncTask[step] = {};
                        }
                    }),

                // 甚至可以放异步任务
                fetchInitialData: async () => {
                    // const data = await someApi.get();
                    // // 注意：这里由于 actions 在 state 内部，逻辑是一致的
                    // set((state) => { state.syncTask.step1 = data });
                },
            },
        })),
        {
            name: "offline-sync-storage",
            storage: createJSONStorage(() => sessionStorage),
            // 持久化过滤：只持久化变量，不持久化 actions 对象
            partialize: (state) => ({ syncTask: state.syncTask }),
        },
    ),
);

export const useSyncActions = () => useSyncStore((state) => state.actions);
