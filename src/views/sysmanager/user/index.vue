<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  VxePagerEvents,
  VxeColumnProps,
  VXETable,
  VxeFormPropTypes
} from "vxe-table";
import {
  UploadProps,
  ElMessage,
  UploadRawFile,
  genFileId,
  UploadInstance
} from "element-plus";
import ots from "/@/components/Organization/OrganizationTreeSelect.vue";
import { userSecurity } from "/@/views/securitycode";
import { fileUpload } from "/@/api/fileupload";
import { getOrgTree } from "/@/api/organization";
import {
  getUserList,
  submitUser,
  deleteUser,
  importUser,
  exportUserList
} from "/@/api/user";
import { downloadFile } from "/@/utils/download";

const $pageOption = reactive({
  searchData: {
    name: "",
    telephone: "",
    organizationId: "",
    pageSize: 20,
    pageIndex: 1
  },
  pagination: {
    total: 0,
    data: []
  },
  infoOption: {
    showModal: false,
    submitLoading: false,
    selectRow: null
  },
  formData: {
    id: 0,
    organizationId: "",
    account: "",
    password: "",
    confirmPassword: "",
    name: "",
    telephone: "",
    email: "",
    remark: ""
  },
  formRules: {
    account: [
      { required: true, message: "请输入账号" },
      { min: 2, max: 32, message: "长度在 2 到 32 个字符" }
    ],
    password: [
      { required: true, message: "请输入密码" },
      { min: 5, max: 32, message: "长度在 5 到 32 个字符" }
    ],
    confirmPassword: [
      { required: true, message: "确认密码" },
      { min: 5, max: 32, message: "长度在 5 到 32 个字符" }
    ],
    name: [{ required: true, message: "请输入姓名" }],
    organizationId: [{ required: true, message: "请选择组织机构" }],
    email: [
      { required: true, message: "请输入邮箱" },
      {
        pattern: "^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$",
        message: "请输入正确的邮箱格式"
      }
    ],
    telephone: [
      { required: true, message: "请输入电话" },
      {
        pattern: "^1([3456789][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$",
        message: "请输入正确的电话号码"
      }
    ]
  } as VxeFormPropTypes.Rules,
  gridColumns: [
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "name", title: "姓名" },
    { field: "telephone", title: "电话" },
    { field: "email", title: "邮箱" },
    { field: "account", title: "账号" },
    { field: "orgName", title: "组织机构" },
    { field: "signinedTime", title: "登陆时间" },
    { field: "remark", title: "备注" },
    {
      field: "operate",
      align: "center",
      width: 150,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[],
  importModal: {
    showModal: false,
    stepActive: 0,
    nextButtonDisabled: false,
    fileList: [],
    resFileName: "",
    errorData: []
  },
  treeData: []
});

const getList = () => {
  getUserList($pageOption.searchData).then((result: any) => {
    const { items, totalCount } = result;
    $pageOption.pagination.data = items;
    $pageOption.pagination.total = totalCount;
  });
};
const initOrgTree = () => {
  getOrgTree().then((data: any) => {
    $pageOption.treeData = data;
  });
};
initOrgTree();
getList();
const pageChangeEvent: VxePagerEvents.PageChange = ({
  currentPage,
  pageSize
}) => {
  $pageOption.searchData.pageIndex = currentPage;
  $pageOption.searchData.pageSize = pageSize;
  getList();
};
const insertEvent = () => {
  $pageOption.formData = {
    id: 0,
    organizationId: "",
    account: "",
    password: "",
    confirmPassword: "",
    name: "",
    telephone: "",
    email: "",
    remark: ""
  };
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    organizationId: row.organizationId.toString(),
    name: row.name,
    telephone: row.telephone,
    email: row.email,
    account: row.account,
    password: row.password,
    confirmPassword: row.confirmPassword,
    remark: row.remark
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showModal = true;
};
const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitUser($pageOption.formData)
    .then(() => {
      $pageOption.infoOption.submitLoading = false;
      $pageOption.infoOption.showModal = false;
      VXETable.modal.message({ content: "保存成功", status: "success" });
      getList();
    })
    .catch(() => {
      $pageOption.infoOption.submitLoading = false;
    });
};
const deleteEvent = async (row: any) => {
  const type = await VXETable.modal.confirm("您确定要删除吗？");
  if (type == "confirm") {
    let param = { userids: row.id };
    deleteUser(param).then(() => {
      VXETable.modal.message({ content: "删除成功", status: "success" });
      getList();
    });
  }
};
const next = () => {
  //动态加载列
  if ($pageOption.importModal.stepActive == 0) {
    //动态加载有问题的数据
    importUser($pageOption.importModal.resFileName)
      .then(() => {
        next();
      })
      .catch((errorData: any) => {
        $pageOption.importModal.errorData = errorData;
        $pageOption.importModal.nextButtonDisabled = false;
      });
  }
  $pageOption.importModal.stepActive++;
};
const pre = () => {
  $pageOption.importModal.nextButtonDisabled = true;
  $pageOption.importModal.stepActive--;
};
const importEvent = () => {
  $pageOption.importModal.stepActive = 0;
  $pageOption.importModal.nextButtonDisabled = false;
  $pageOption.importModal.fileList = [];
  $pageOption.importModal.showModal = true;
};
const beforeUpload: UploadProps["beforeUpload"] = rawFile => {
  let fileExt = rawFile.name.substring(rawFile.name.lastIndexOf(".") + 1);
  if (["xls", "xlsx"].indexOf(fileExt) == -1) {
    ElMessage.error("文件格式错误");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error("超出规定文件大小");
    return false;
  }
  return true;
};

const handleSuccess: UploadProps["onSuccess"] = resFileName => {
  $pageOption.importModal.resFileName = resFileName;
  $pageOption.importModal.nextButtonDisabled = true;
};

const upload = ref<UploadInstance>();
defineExpose({
  upload
});
const handleExceed: UploadProps["onExceed"] = files => {
  const file = files[0] as UploadRawFile;
  if (beforeUpload(file)) {
    upload.value!.clearFiles();
    file.uid = genFileId();
    upload.value!.handleStart(file);
  }
};

const handleRemove: UploadProps["onRemove"] = () => {
  $pageOption.importModal.nextButtonDisabled = false;
};

const exportEvent = () => {
  exportUserList($pageOption.searchData).then(result => {
    downloadFile(result);
  });
};
interface Tree {
  value: string;
  label: string;
  children?: Tree[];
}
const handleNodeClick = (data: Tree) => {
  $pageOption.searchData.organizationId = data.value;
  getList();
};
</script>

<template>
  <div>
    <el-container style="position: relative">
      <el-aside width="300px">
        <el-card style="height: 785px; overflow: auto">
          <el-tree
            :highlight-current="true"
            :default-expand-all="true"
            :expand-on-click-node="false"
            :data="$pageOption.treeData"
            @node-click="handleNodeClick"
          />
        </el-card>
      </el-aside>
      <el-container>
        <el-main style="padding: 0px 0px 0px 10px">
          <el-card>
            <vxe-form :data="$pageOption.searchData" @submit="getList">
              <vxe-form-item title="姓名" field="name" :item-render="{}">
                <template #default="{ data }">
                  <vxe-input
                    v-model="data.name"
                    placeholder="请输入姓名"
                    clearable
                  />
                </template>
              </vxe-form-item>
              <vxe-form-item title="电话" field="telephone" :item-render="{}">
                <template #default="{ data }">
                  <vxe-input
                    v-model="data.telephone"
                    placeholder="请输入电话"
                  />
                </template>
              </vxe-form-item>
              <vxe-form-item>
                <template #default>
                  <vxe-button
                    type="submit"
                    icon="fa fa-search"
                    status="primary"
                    content="查询"
                  />
                  <vxe-button
                    icon="fa fa-undo"
                    type="reset"
                    status="info"
                    content="重置"
                  />
                </template>
              </vxe-form-item>
            </vxe-form>
            <vxe-toolbar>
              <template #tools>
                <vxe-button
                  icon="fa fa-plus"
                  status="success"
                  content="新增"
                  v-auth="userSecurity.add"
                  @click="insertEvent"
                />
                <vxe-button
                  icon="fa fa-upload"
                  status="warning"
                  content="导入"
                  v-auth="userSecurity.import"
                  @click="importEvent"
                />
                <vxe-button
                  icon="fa fa-download"
                  status="danger"
                  content="导出"
                  v-auth="userSecurity.export"
                  @click="exportEvent"
                />
              </template>
            </vxe-toolbar>
            <vxe-grid
              :height="650"
              :data="$pageOption.pagination.data"
              ref="xGrid"
              :columns="$pageOption.gridColumns"
            >
              <template #operate="{ row }">
                <vxe-button
                  icon="fa fa-edit"
                  title="修改"
                  circle
                  v-auth="userSecurity.edit"
                  @click="editEvent(row)"
                />
                <vxe-button
                  icon="fa fa-trash"
                  title="删除"
                  circle
                  v-auth="userSecurity.delete"
                  @click="deleteEvent(row)"
                />
                <!-- <vxe-button icon="fa fa-eye" title="查看" circle /> -->
              </template>
              <template #pager>
                <vxe-pager
                  v-model:current-page="$pageOption.searchData.pageIndex"
                  v-model:page-size="$pageOption.searchData.pageSize"
                  :total="$pageOption.pagination.total"
                  @page-change="pageChangeEvent"
                />
              </template>
            </vxe-grid>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
    <vxe-modal
      v-model="$pageOption.infoOption.showModal"
      :title="
        $pageOption.infoOption.selectRow
          ? '编辑数据->' + $pageOption.infoOption.selectRow.name
          : '新增数据'
      "
      width="800"
      min-width="600"
      min-height="300"
      :loading="$pageOption.infoOption.submitLoading"
      resize
      destroy-on-close
    >
      <template #default>
        <vxe-form
          :data="$pageOption.formData"
          :rules="$pageOption.formRules"
          title-align="right"
          title-width="100"
          @submit="submitEvent"
        >
          <vxe-form-item
            title="基本信息"
            title-align="left"
            :title-width="200"
            :span="24"
            :title-prefix="{ icon: 'fa fa-address-card-o' }"
          />
          <vxe-form-item field="name" title="姓名" :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="请输入姓名" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="telephone"
            title="电话"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.telephone" placeholder="请输入电话" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="email"
            title="邮箱"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.email" placeholder="请输入邮箱" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="organizationId"
            title="组织机构"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <ots v-model="data.organizationId" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            title="账号信息"
            title-align="left"
            :title-width="200"
            :span="24"
            :title-prefix="{
              message: '用户名和密码',
              icon: 'fa fa-info-circle'
            }"
          />
          <vxe-form-item
            field="account"
            title="用户名"
            :span="24"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input
                :disabled="$pageOption.infoOption.selectRow != null"
                v-model="data.account"
                placeholder="请输入用户名"
              />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="password"
            title="密码"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input
                type="password"
                v-model="data.password"
                placeholder="请输入密码"
              />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="confirmPassword"
            title="密码"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input
                type="password"
                v-model="data.confirmPassword"
                placeholder="确认密码"
              />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="remark"
            title="备注信息"
            :span="24"
            :item-render="{}"
            :title-suffix="{
              message: '备注信息！！',
              icon: 'fa fa-question-circle'
            }"
          >
            <template #default="{ data }">
              <vxe-textarea
                v-model="data.remark"
                :autosize="{ minRows: 2, maxRows: 4 }"
              />
            </template>
          </vxe-form-item>
          <vxe-form-item align="center" title-align="left" :span="24">
            <template #default>
              <vxe-button type="submit">提交</vxe-button>
              <vxe-button type="reset">重置</vxe-button>
            </template>
          </vxe-form-item>
        </vxe-form>
      </template>
    </vxe-modal>
    <vxe-modal
      v-model="$pageOption.importModal.showModal"
      width="800"
      min-height="400"
    >
      <el-card>
        <el-steps
          :active="$pageOption.importModal.stepActive"
          align-center
          finish-status="success"
        >
          <el-step title="上传文件">1</el-step>
          <el-step title="导入数据">2</el-step>
        </el-steps>
        <el-divider />
        <div v-if="$pageOption.importModal.stepActive == 0">
          <el-upload
            action=""
            ref="upload"
            :limit="1"
            :file-list="$pageOption.importModal.fileList"
            :on-success="handleSuccess"
            :on-exceed="handleExceed"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :http-request="fileUpload"
          >
            <el-button type="primary">点击上传</el-button>

            <template #tip>
              <div class="el-upload__tip">excel文件，且不大于2M</div>
            </template>
          </el-upload>
        </div>
        <div v-if="$pageOption.importModal.stepActive == 1">
          <vxe-table
            size="mini"
            height="300"
            ref="xTable"
            :data="$pageOption.importModal.errorData"
          >
            <vxe-column type="seq" width="60" align="center" />
            <vxe-column field="name" title="姓名" />
            <vxe-column field="account" title="账号" />
            <vxe-column field="email" title="邮箱" />
            <vxe-column field="telephone" title="电话" />
          </vxe-table>
        </div>
        <div v-if="$pageOption.importModal.stepActive == 2">
          <el-result icon="success" title="导入成功">
            <template #extra>
              <el-button
                @click="$pageOption.importModal.showModal = false"
                type="primary"
                >返回</el-button
              >
            </template>
          </el-result>
        </div>
      </el-card>
      <el-button
        style="margin-top: 12px"
        type="primary"
        :disabled="!$pageOption.importModal.nextButtonDisabled"
        v-if="$pageOption.importModal.stepActive == 0"
        @click="next"
        >下一步</el-button
      >
      <el-button
        style="margin-top: 12px"
        type="primary"
        v-show="$pageOption.importModal.stepActive == 1"
        @click="pre"
        >上一步</el-button
      >
    </vxe-modal>
  </div>
</template>

<style scoped>
.org-tree {
  padding: 20px;
  height: 100%;
  border-radius: 5px;
}
</style>
