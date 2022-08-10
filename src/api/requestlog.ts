import request from "../utils/http/index";

export const getRequestLogs = (params: any) => {
  return request({
    url: "request-log/list",
    method: "get",
    params
  });
};
