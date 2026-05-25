import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/server/overview";

export const useOverview = () => {
    return useQuery({
        queryKey: ["overview"],
        queryFn: getOverview,
    });
};
