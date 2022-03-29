import request from "../utils/http/index";

export const getAsyncRoutes = (params?: object) => {
  return request({
    url: "/user/menus",
    method: "get",
    params
  });
};
