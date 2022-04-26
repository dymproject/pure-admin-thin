import request from "../utils/http/index";

export const getOrgList = (params: any) => {
  return request({
    url: "/organization/list",
    method: "get",
    params
  });
};

export const submitOrg = (params: any) => {
  return request({
    url: "/organization",
    method: params.id ? "put" : "post",
    data: params
  });
};

export const deleteOrg = (id: number) => {
  return request({
    url: "/organization/" + id,
    method: "delete"
  });
};

export const getOrgTree = () => {
  return request({
    url: "/organization/tree",
    method: "get"
  });
};
