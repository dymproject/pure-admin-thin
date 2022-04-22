<script setup lang="ts">
import { reactive } from "vue";
import {
  VxePagerEvents,
  VxeColumnProps,
  VXETable,
  VxeFormPropTypes
} from "vxe-table";
import { userSecurity } from "/@/views/securitycode";
import { getConfigList, submitConfig, deleteConfig } from "/@/api/sysconfig";

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
    key: "",
    value: "",
    remark: ""
  },
  formRules: {
    name: [
      { required: true, message: "请输入配置名称" },
      { min: 2, max: 32, message: "长度在 2 到 32 个字符" }
    ],
    key: [
      { required: true, message: "key不能为空" },
      { min: 2, max: 32, message: "长度在 2 到 32 个字符" }
    ],
    value: [{ required: true, message: "值不能为空" }]
  } as VxeFormPropTypes.Rules,
  gridColumns: [
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "name", title: "姓名" },
    { field: "key", title: "配置Key" },
    { field: "value", title: "配置Value" },
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
  getConfigList($pageOption.searchData).then((result: any) => {
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
    key: "",
    value: "",
    remark: ""
  };
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    name: row.name,
    key: row.key,
    value: row.value,
    remark: row.remark
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showModal = true;
};
const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitConfig($pageOption.formData)
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
  console.log(row);
  const type = await VXETable.modal.confirm("您确定要删除吗？");
  if (type == "confirm") {
    deleteConfig(row.id).then(() => {
      VXETable.modal.message({ content: "删除成功", status: "success" });
      getList();
    });
  }
};
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="配置名称" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入配置名称"
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
            v-auth="userSecurity.add"
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
            :layouts="[
              'Sizes',
              'PrevJump',
              'PrevPage',
              'Number',
              'NextPage',
              'NextJump',
              'FullJump',
              'Total'
            ]"
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
            title="配置名称"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="配置名称" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            title="配置信息"
            title-align="left"
            :title-width="200"
            :span="24"
            :title-prefix="{
              message: '配置键值',
              icon: 'fa fa-info-circle'
            }"
          />
          <vxe-form-item
            field="key"
            title="配置项key"
            :span="24"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.key" placeholder="请输入Key" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="value"
            title="配置项值"
            :span="24"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.value" placeholder="请输入Value" />
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
