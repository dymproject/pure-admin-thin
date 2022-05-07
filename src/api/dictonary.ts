import request from "../utils/http/index";

export const getDictonaryDataList = (params: any) => {
  return request({
    url: "dictonarydata/list",
    method: "get",
    params
  });
};

export const submitDictonaryData = (params: any) => {
  return request({
    url: "dictonarydata",
    method: params.id ? "put" : "post",
    data: params
  });
};

export const deleteDictonaryData = (categoryId: number) => {
  return request({
    url: "dictonarydata/" + categoryId,
    method: "delete"
  });
};

export const getDictonaryChildren = (id: number) => {
  return request({
    url: "dictonarydata/" + id + "/data",
    method: "get"
  });
};
