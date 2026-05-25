import { useOverview } from "@/hooks/useOverview";

export default function Overview() {
    const { data, isLoading } = useOverview();

    return (
        <div>
            <div className="text-primary">Overview Page {isLoading}</div>
            {isLoading ? <p>Loading...</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}
