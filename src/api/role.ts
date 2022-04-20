import request from "../utils/http/index";

export const getRoles = (params: any) => {
  return request({
    url: "role/list",
    method: "get",
    params
  });
};

export const submitRole = (params: any) => {
  if (params.id) {
    return request({
      url: "/role/" + params.id + "/modify",
      method: "put",
      data: params
    });
  } else {
    return request({
      url: "/role/add",
      method: "post",
      data: params
    });
  }
};

export const deleteRole = (params: any) => {
  return request({
    url: "/role/" + params.rowid,
    method: "delete"
  });
};

export const getUserList = (roleid: number, params: any) => {
  return request({
    url: "/role/" + roleid + "/user",
    method: "get",
    params
  });
};

export const bindUser = (roleid: number, params: any) => {
  return request({
    url: "/role/" + roleid + "/bind-user",
    method: "post",
    data: params
  });
};

export const unbindUser = (roleid: number, params: any) => {
  return request({
    url: "/role/" + roleid + "/unbind-user",
    method: "post",
    data: params
  });
};

export const getRoleSecurities = (roleid: number) => {
  return request({
    url: "/role/" + roleid + "/securities",
    method: "get"
  });
};

export const getRoleMenus = (roleid: number) => {
  return request({
    url: "/role/" + roleid + "/menus",
    method: "get"
  });
};
