import request from "../utils/http/index";

export const getLogin = (params: object) => {
  return request({
    url: "/auth/login",
    method: "post",
    data: params
  });
};

export const getUserList = (params: object) => {
  return request({
    url: "/user/list",
    method: "get",
    data: params
  });
};
