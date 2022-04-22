import request from "../utils/http/index";

export const getConfigList = (params: any) => {
  return request({
    url: "/configdata/list",
    method: "get",
    params
  });
};

export const submitConfig = (params: any) => {
  return request({
    url: "/configdata",
    method: params.id ? "put" : "post",
    data: params
  });
};

export const deleteConfig = (id: number) => {
  return request({
    url: "/configdata/" + id,
    method: "delete"
  });
};
