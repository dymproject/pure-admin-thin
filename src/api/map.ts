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

/**
 * 解密 JWT token 的信息
 * @param token jwt token 字符串
 * @returns <any>object
 */
export const decryptJWT = (token: string): any => {
  token = token.replace(/_/g, "/").replace(/-/g, "+");
  const json = decodeURIComponent(escape(window.atob(token.split(".")[1])));
  return JSON.parse(json);
};

export interface TrackData {
  battery: number;
  gnssTime: Date;
  heading: number;
  latitude: number;
  locateMode: string;
  longitude: number;
  mac: string;
  mileage: number;
  offsetX: number;
  offsetY: number;
  position: string;
  precision: number;
  satellitenCount: number;
  signalStrength: number;
  speed: number;
  status: string;
}

export interface TrackDataProfile extends TrackData {
  carId: number;
  plateNo: string;
  orgName: string;
}

export interface CarTreeProfile {
  id: number;
  label: string;
  children: CarTreeProfile[];
  trackData: TrackData;
  isOrganization: boolean;
  count: number;
  onlineCount: number;
  icon: string;
  mac: string;
  color: string;
}
