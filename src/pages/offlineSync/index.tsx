import { useState } from "react";
import { Button, Steps } from "antd";
import { useSyncActions } from "@/store/useSyncStore";

const stepKeys = ["step1", "step2", "step3"] as const;

export default function OfflineSync() {
    const [current, setCurrent] = useState(0);
    const { setSyncTask, clearSyncTask } = useSyncActions();

    const handleNext = () => {
        const stepKey = stepKeys[current];
        setSyncTask(stepKey, { value: Math.random(), time: Date.now() });
        setCurrent((prev) => Math.min(prev + 1, stepKeys.length - 1));
    };

    const handleFinish = () => {
        clearSyncTask("all");
        sessionStorage.removeItem("offline-sync-storage");
        setCurrent(0);
    };

    return (
        <div>
            <h1>Offline Sync Page</h1>
            <Steps
                current={current}
                items={[{ title: "Step 1" }, { title: "Step 2" }, { title: "Step 3" }]}
                style={{ marginBottom: 24 }}
            />
            <div>
                {current < stepKeys.length - 1 ? (
                    <Button type="primary" onClick={handleNext}>
                        下一步
                    </Button>
                ) : (
                    <Button type="primary" onClick={handleFinish}>
                        完成
                    </Button>
                )}
            </div>
        </div>
    );
}
