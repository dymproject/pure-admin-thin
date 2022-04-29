import request from "../utils/http/index";

export const getTenantList = (params: any) => {
  return request({
    url: "/tenant/list",
    method: "get",
    params
  });
};

export const submitTenant = (params: any) => {
  return request({
    url: "/tenant",
    method: params.id ? "put" : "post",
    data: params
  });
};
