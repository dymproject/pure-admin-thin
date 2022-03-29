import Axios from "axios";

// import qs from "qs";
import NProgress from "../progress";
import { loadEnv } from "@build/index";
import { getToken } from "/@/utils/auth";
import { useUserStoreHook } from "/@/store/modules/user";
import { ElLoading, ElMessage } from "element-plus";

let loading;
// create an axios instance
const service = Axios.create({
  baseURL: loadEnv().VITE_PROXY_DOMAIN_REAL + loadEnv().VITE_PROXY_DOMAIN, // url = base url + request url
  withCredentials: false, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
});

// request interceptor
service.interceptors.request.use(
  config => {
    //开启进度条
    NProgress.start();
    loading = ElLoading.service({
      lock: true,
      text: "Loading",
      background: "rgba(0, 0, 0, 0.7)"
    });
    const tokenData = getToken();
    if (tokenData) {
      const now = new Date().getTime();
      const expired = (tokenData.expires - now) / (1000 * 60) <= 10;
      if (expired) {
        config.headers["X-Authorization"] = "Bearer " + tokenData.refreshToken;
      }
      config.headers["Authorization"] = "Bearer " + tokenData.accessToken;
    }
    return config;
  },
  error => {
    console.log(error.toString());
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const { headers } = response;
    const { statusCode, errors, data } = response.data;
    // 关闭进度条动画
    NProgress.done();
    loading.close();
    //刷新token时
    const accessToken = headers["access-token"];
    if (accessToken) {
      useUserStoreHook().SET_TOKEN(accessToken.toString());
    }
    const refreshToken = headers["x-access-token"];
    if (refreshToken) {
      useUserStoreHook().SET_REFRESHTOKEN(refreshToken.toString());
    }
    if (statusCode == 401) {
      useUserStoreHook().logOut();
    } else if (statusCode == 200) {
      return data;
    } else {
      ElMessage.error(errors);
      return Promise.reject(errors);
    }
  },
  error => {
    ElMessage.error(error.toString());
    loading.close();
    return Promise.reject(error);
  }
);
export default service;
