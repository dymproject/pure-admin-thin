import request from "../utils/http/index";

export const getMenus = (params: any) => {
  return request({
    url: "menu/list",
    method: "get",
    params
  });
};
export const getAllMenu = (params: any) => {
  return request({
    url: "menu/all",
    method: "get",
    params
  });
};

export const giveRoleMenus = (roleid: number, params: any) => {
  return request({
    url: "menu/give/" + roleid,
    method: "post",
    data: params
  });
};
