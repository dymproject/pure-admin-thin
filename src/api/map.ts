import request from "../utils/http/index";

export const getCarTree = () => {
  return request({
    url: "/map/cartree",
    method: "get"
  });
};
