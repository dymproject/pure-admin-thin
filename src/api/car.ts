import request from "../utils/http/index";

export const getCarList = (params: any) => {
  return request({
    url: "/car/list",
    method: "get",
    params
  });
};

export const submitCar = (params: any) => {
  return request({
    url: "/car",
    method: params.id ? "put" : "post",
    data: params
  });
};

export const deleteCar = (params: any) => {
  return request({
    url: "/car/" + params.id,
    method: "delete"
  });
};

export const importCar = (params: any) => {
  return request({
    url: "/car/import/" + params,
    method: "post"
  });
};

export const exportCarList = (params: any) => {
  return request({
    url: "/car/export",
    method: "get",
    params,
    responseType: "blob"
  });
};
