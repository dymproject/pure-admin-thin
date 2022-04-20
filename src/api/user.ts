import request from "../utils/http/index";

export const getLogin = (params: object) => {
  return request({
    url: "/auth/login",
    method: "post",
    data: params
  });
};

export const getSecurities = () => {
  return request({
    url: "auth/securities",
    method: "get"
  });
};

export const getUserList = (params: any) => {
  return request({
    url: "/user/list",
    method: "get",
    params
  });
};

export const submitUser = (params: any) => {
  if (params.id) {
    return request({
      url: "/user/" + params.id + "/modify",
      method: "put",
      data: params
    });
  } else {
    return request({
      url: "/user/add",
      method: "post",
      data: params
    });
  }
};

export const deleteUser = (params: any) => {
  return request({
    url: "/user",
    method: "delete",
    params
  });
};

export const importUser = (params: any) => {
  return request({
    url: "/user/batch-add/" + params,
    method: "post"
  });
};

export const exportUserList = (params: any) => {
  return request({
    url: "/user/export",
    method: "get",
    params,
    responseType: "blob"
  });
};
