import request from "../utils/http/index";

export const getAsyncRoutes = (params?: object) => {
  return request({
    url: "/auth/menus",
    method: "get",
    params
  });
};
