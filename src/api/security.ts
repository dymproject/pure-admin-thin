import request from "../utils/http/index";

export const getSecurities = (params: any) => {
  return request({
    url: "security/list",
    method: "get",
    params
  });
};

export const getAllSecurity = (params: any) => {
  return request({
    url: "security/all",
    method: "get",
    params
  });
};

export const giveRoleSecurities = (roleid: number, params: any) => {
  return request({
    url: "security/give/" + roleid,
    method: "post",
    data: params
  });
};
