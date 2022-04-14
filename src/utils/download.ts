import { AxiosResponse } from "axios";

export const downloadFile = (response: AxiosResponse<any, any>) => {
  const { headers } = response;
  const {
    "content-type": contentType,
    "content-disposition": contentDisposition
  } = headers;
  const blob = new Blob([response.data], {
    type: contentType
  });
  const patt = new RegExp("filename*=([^;]+\\.[^\\.;]+);*");
  const result = patt.exec(contentDisposition);
  const filename = decodeURI(result[1]); // 处理文件名,解决中文乱码问题
  const downloadElement = document.createElement("a");
  const href = window.URL.createObjectURL(blob); // 创建下载的链接
  downloadElement.style.display = "none";
  downloadElement.href = href;
  downloadElement.download = filename; // 下载后文件名
  document.body.appendChild(downloadElement);
  downloadElement.click(); // 点击下载
  document.body.removeChild(downloadElement); // 下载完成移除元素
  window.URL.revokeObjectURL(href);
};
