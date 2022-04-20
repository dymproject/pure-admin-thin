import Axios from "axios";

// import qs from "qs";
import NProgress from "../progress";
import { loadEnv } from "@build/index";
import { getToken, setToken, removeToken } from "/@/utils/auth";
import { ElMessage, ElMessageBox } from "element-plus";

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
    const tokenData = getToken();
    if (tokenData) {
      const now = new Date().getTime();
      const expired = (tokenData.expires - now) / (1000 * 60) <= 0;
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
    const { headers, status, config } = response;
    const { responseType } = config;
    const { code, extras, data, success, message } = response.data;
    // 关闭进度条动画
    NProgress.done();
    //刷新token时
    const accessToken = headers["access-token"];
    const refreshToken = headers["x-access-token"];
    if (accessToken != undefined && accessToken != undefined) {
      const tokenData = getToken();
      if (tokenData) {
        tokenData.refreshToken = refreshToken;
        tokenData.accessToken = accessToken;
        setToken(tokenData);
      }
    }
    console.log(response);
    if (status == 200) {
      //先判断是否是文件流
      if (responseType == "blob") {
        return response;
      } else if (success) {
        return data;
      } else {
        if (code == 401) {
          ElMessageBox.confirm("长时间未操作，请重新登录", "提醒", {
            confirmButtonText: "返回登录",
            type: "warning"
          })
            .then(() => {
              removeToken();
              location.reload();
            })
            .catch(() => {
              return Promise.reject(extras);
            });
        } else {
          ElMessage.error(JSON.stringify(message));
          return Promise.reject(extras);
        }
      }
    }
  },
  error => {
    ElMessage.error(error.toString());
    return Promise.reject(error);
  }
);
export default service;
