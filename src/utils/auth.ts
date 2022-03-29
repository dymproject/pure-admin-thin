import Cookies from "js-cookie";
import { useUserStoreHook } from "/@/store/modules/user";

const TokenKey = "authorized-token";

type paramsMapType = {
  name: string;
  account: string;
  accessToken: string;
  refreshToken: string;
  expires: number;
};

type TokenType = {
  name: string;
  account: string;
  accessToken: string;
  refreshToken: string;
  expires: number;
};

// 获取token
export function getToken(): TokenType {
  // 此处与TokenKey相同，此写法解决初始化时Cookies中不存在TokenKey报错
  const token = Cookies.get("authorized-token");
  if (token) {
    return JSON.parse(token);
  }
  return undefined;
}

// 设置token以及过期时间（cookies、sessionStorage各一份）
// 后端需要将用户信息和token以及过期时间都返回给前端，过期时间主要用于刷新token
export function setToken(data) {
  const { name, account, accessToken, refreshToken } = data;
  const thirtyMinutes = new Date(
    new Date().getTime() + 30 * 60 * 1000
  ).getTime();
  // 提取关键信息进行存储
  const paramsMap: paramsMapType = {
    name,
    account,
    accessToken,
    refreshToken,
    expires: thirtyMinutes
  };
  const dataString = JSON.stringify(paramsMap);
  useUserStoreHook().SET_NAME(name);
  useUserStoreHook().SET_ACCOUNT(account);
  useUserStoreHook().SET_TOKEN(accessToken);
  useUserStoreHook().SET_REFRESHTOKEN(refreshToken);
  Cookies.set(TokenKey, dataString, {
    expires: thirtyMinutes
  });
  sessionStorage.setItem(TokenKey, dataString);
}

// 删除token
export function removeToken() {
  Cookies.remove(TokenKey);
  sessionStorage.removeItem(TokenKey);
}
