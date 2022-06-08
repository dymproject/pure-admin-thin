import request from "../utils/http/index";

export const getCarTree = () => {
  return request({
    url: "/map/cartree",
    method: "get"
  });
};

export const getLastTrack = () => {
  return request({
    url: "/map/lasttrack",
    method: "get"
  });
};
