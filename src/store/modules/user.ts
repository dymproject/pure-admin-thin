import { defineStore } from "pinia";
import { store } from "/@/store";
import { userType } from "./types";
import { router } from "/@/router";
import { getToken, removeToken } from "/@/utils/auth";

const data = getToken();
let token = "";
let name = "";
let account = "";
let refreshToken = "";
if (data) {
  const dataJson = data;
  if (dataJson) {
    token = dataJson?.accessToken;
    refreshToken = dataJson?.refreshToken;
    name = dataJson?.name ?? "佚名";
    account = dataJson?.account ?? "admin";
  }
}

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    token,
    refreshToken,
    account,
    name
  }),
  actions: {
    SET_TOKEN(token: string) {
      this.token = token;
    },
    SET_NAME(name: string) {
      this.name = name;
    },
    SET_ACCOUNT(account: string) {
      this.account = account;
    },
    SET_REFRESHTOKEN(refreshToken: string) {
      this.refreshToken = refreshToken;
    },
    // 登出 清空缓存
    logOut() {
      removeToken();
      router.push("/login");
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
