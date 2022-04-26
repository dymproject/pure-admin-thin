<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  VxeColumnProps,
  VxeFormPropTypes,
  VXETable,
  VxeTableInstance
} from "vxe-table";
import { getOrgList, submitOrg, deleteOrg } from "/@/api/organization";
import { organizationSecurity } from "../../securitycode";
const xGrid = ref({} as VxeTableInstance);
defineExpose({
  xGrid
});
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
    pid: null,
    name: "",
    telephone: "",
    leader: "",
    rank: 0,
    remark: ""
  },
  formRules: {
    name: [{ required: true, message: "请输入组织机构名称" }],
    telephone: [
      {
        pattern: "^1([3456789][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$",
        message: "请输入正确的电话号码"
      }
    ]
  } as VxeFormPropTypes.Rules,
  gridColumns: [
    { type: "seq", title: "序号", width: 100, align: "center" },
    { field: "name", title: "组织机构名称", treeNode: "true" },
    { field: "leader", title: "负责人" },
    { field: "telephone", title: "电话" },
    { field: "remark", title: "备注", showOverflow: true },
    {
      field: "operate",
      align: "center",
      width: 250,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[]
});

const getList = () => {
  getOrgList($pageOption.searchData).then((result: any) => {
    $pageOption.pagination.data = result;
    setTimeout(() => {
      xGrid.value.setAllTreeExpand(true);
    }, 500);
  });
};
getList();

const insertEvent = (row: any) => {
  $pageOption.formData = {
    id: 0,
    pid: null,
    name: "",
    telephone: "",
    leader: "",
    rank: 0,
    remark: ""
  };
  if (row) {
    $pageOption.formData.pid = row.id;
  }
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    pid: row.pid,
    name: row.name,
    telephone: row.telephone,
    leader: row.leader,
    rank: row.rank,
    remark: row.remark
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showModal = true;
};
const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitOrg($pageOption.formData)
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
    deleteOrg(row.id).then(() => {
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
        <vxe-form-item title="组织机构名称" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入组织机构名称"
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
      <vxe-grid
        ref="xGrid"
        :height="650"
        :tree-config="{
          transform: true,
          rowField: 'id',
          parentField: 'pid'
        }"
        :data="$pageOption.pagination.data"
        :columns="$pageOption.gridColumns"
      >
        <template #operate="{ row }">
          <vxe-button
            icon="fa fa-edit"
            title="修改"
            circle
            v-auth="organizationSecurity.edit"
            @click="editEvent(row)"
          />
          <vxe-button
            icon="fa fa-trash"
            title="删除"
            circle
            v-auth="organizationSecurity.delete"
            @click="deleteEvent(row)"
          />
          <vxe-button
            icon="fa fa-plus"
            title="增加分类数据"
            circle
            v-auth="organizationSecurity.add"
            @click="insertEvent(row)"
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
            field="name"
            title="组织机构名称"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="组织机构名称" />
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
            field="leader"
            title="负责人"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.leader" placeholder="请输入负责人" />
            </template>
          </vxe-form-item>
          <vxe-form-item field="rank" title="排序" :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input
                type="integer"
                v-model="data.rank"
                placeholder="排序"
              />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="remark"
            title="备注信息"
            :span="24"
            :item-render="{}"
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
