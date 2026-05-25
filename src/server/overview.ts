// /themis/api/v1/jobs/overview/addedToday
// get 请求
import request from "@/utils/request";

export const getOverview = () => {
    return request.get({
        url: "/themis/api/v1/jobs/overview/addedToday",
    });
};
