<script setup lang="ts">
import { reactive } from "vue";
import {
  VxePagerEvents,
  VxeColumnProps,
  VXETable,
  VxeFormPropTypes
} from "vxe-table";
import { tenantSecurity } from "/@/views/securitycode";
import { getTenantList, submitTenant } from "/@/api/tenant";

const $pageOption = reactive({
  searchData: {
    name: "",
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
    name: "",
    account: "",
    password: "",
    remark: ""
  },
  formRules: {
    name: [
      { required: true, message: "请输入配置名称" },
      { min: 2, max: 32, message: "长度在 2 到 32 个字符" }
    ],
    account: [
      { required: true, message: "账号不能为空" },
      { min: 2, max: 32, message: "长度在 2 到 32 个字符" }
    ],
    password: [{ required: true, message: "密码不能为空" }]
  } as VxeFormPropTypes.Rules,
  gridColumns: [
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "name", title: "姓名" },
    { field: "account", title: "账号" },
    { field: "password", title: "密码" },
    { field: "remark", title: "备注" },
    {
      field: "operate",
      align: "center",
      width: 150,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[]
});

const getList = () => {
  getTenantList($pageOption.searchData).then((result: any) => {
    const { items, totalCount } = result;
    $pageOption.pagination.data = items;
    $pageOption.pagination.total = totalCount;
  });
};
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
    name: "",
    account: "",
    password: "",
    remark: ""
  };
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    name: row.name,
    account: row.account,
    password: row.password,
    remark: row.remark
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showModal = true;
};
const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitTenant($pageOption.formData)
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
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="租户名" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入租户名"
              clearable
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
            v-auth="tenantSecurity.add"
            @click="insertEvent"
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
            v-auth="tenantSecurity.edit"
            @click="editEvent(row)"
          />
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
          <vxe-form-item
            field="name"
            title="租户名"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="租户名" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            title="账号信息"
            title-align="left"
            :title-width="200"
            :span="24"
            :title-prefix="{
              message: '账号密码',
              icon: 'fa fa-info-circle'
            }"
          />
          <vxe-form-item
            field="account"
            title="初始化账号"
            :span="24"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.account" placeholder="初始化账号" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="password"
            title="初始化密码"
            :span="24"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input
                type="password"
                v-model="data.password"
                placeholder="初始化密码"
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
  </div>
</template>

<style scoped></style>
