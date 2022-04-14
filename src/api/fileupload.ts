import request from "../utils/http/index";

export const fileUpload = (param: any) => {
  const formData = new FormData();
  formData.append("files", param.file);
  return request({
    url: "/file/upload-file",
    method: "post",
    data: formData
  });
};

export const fileAttachment = (param: any) => {
  const formData = new FormData();
  formData.append("files", param.file);
  return request({
    url: "/file/upload-attachment",
    method: "post",
    data: formData
  });
};
