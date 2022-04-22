import request from "../utils/http/index";

export const getCategories = (params: any) => {
  return request({
    url: "sysdata/list",
    method: "get",
    params
  });
};

export const submitCategory = (params: any) => {
  if (params.id) {
    return request({
      url: "sysdata",
      method: "put",
      data: params
    });
  } else {
    return request({
      url: "sysdata",
      method: "post",
      data: params
    });
  }
};

export const deleteCategory = (categoryId: number) => {
  return request({
    url: "sysdata/" + categoryId,
    method: "delete"
  });
};

export const getCategoriyData = (categoryId: number) => {
  return request({
    url: "sysdata/" + categoryId + "/dictionary-data",
    method: "get"
  });
};

export const submitCateData = (categoryId: number, params: any) => {
  if (params.id) {
    return request({
      url: "sysdata/dictionary-data",
      method: "put",
      data: params
    });
  } else {
    return request({
      url: "sysdata/" + categoryId + "/dictionary-data",
      method: "post",
      data: params
    });
  }
};

export const deleteCategoryData = (id: number) => {
  return request({
    url: "sysdata/dictionary-data/" + id,
    method: "delete"
  });
};
