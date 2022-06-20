<script setup lang="ts">
import { reactive } from "vue";
import { VxePagerEvents, VxeColumnProps, VXETable } from "vxe-table";
import {
  submitDictonaryData,
  getDictonaryDataList,
  deleteDictonaryData
} from "/@/api/dictonary";
import { sysdataSecurity } from "/@/views/securitycode";

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
  gridColumns: [
    // { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "id", title: "字典编号" },
    { field: "name", title: "字典名称", treeNode: "true" },
    { field: "code", title: "字典编码" },
    { field: "rank", title: "排序" },
    {
      field: "operate",
      align: "center",
      width: 250,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[],
  formData: {
    id: null,
    code: null,
    name: "",
    rank: 0,
    parentId: null
  },
  infoOption: {
    showModal: false,
    showCateDataModal: false,
    submitLoading: false,
    selectRow: null,
    categoryId: null
  },
  fromRule: {
    name: [{ required: true, message: "字典名称不能为空" }],
    code: [{ required: true, message: "字典编码不能为空" }],
    rank: [{ required: true, message: "字典排序不能为空" }]
  }
});

const getList = () => {
  getDictonaryDataList($pageOption.searchData).then((result: any) => {
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

const insertEvent = (row: any) => {
  $pageOption.formData = {
    id: null,
    code: null,
    name: "",
    rank: 0,
    parentId: row == undefined ? null : row.id
  };
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    code: row.code,
    name: row.name,
    parentId: row.parentId,
    rank: row.rank
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showModal = true;
};

const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitDictonaryData($pageOption.formData)
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
    deleteDictonaryData(row.id).then(() => {
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
        <vxe-form-item title="字典名称" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入字典名称"
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
            v-auth="sysdataSecurity.add"
            @click="insertEvent"
          />
        </template>
      </vxe-toolbar>
      <vxe-grid
        ref="xGrid"
        :height="650"
        :tree-config="{
          transform: true,
          rowField: 'id',
          parentField: 'parentId'
        }"
        :data="$pageOption.pagination.data"
        :columns="$pageOption.gridColumns"
      >
        <template #operate="{ row }">
          <vxe-button
            icon="fa fa-edit"
            title="修改"
            circle
            v-auth="sysdataSecurity.edit"
            @click="editEvent(row)"
          />
          <vxe-button
            icon="fa fa-trash"
            title="删除"
            circle
            v-show="row.parentId != null"
            v-auth="sysdataSecurity.delete"
            @click="deleteEvent(row)"
          />
          <vxe-button
            icon="fa fa-plus"
            title="增加分类数据"
            circle
            v-show="row.parentId == null"
            v-auth="sysdataSecurity.add"
            @click="insertEvent(row)"
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
          :rules="$pageOption.fromRule"
          title-align="right"
          title-width="100"
          @submit="submitEvent"
        >
          <vxe-form-item
            field="name"
            title="字典名称"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="请输入名称" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="code"
            title="字典编码"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.code" placeholder="请输入编码" />
            </template>
          </vxe-form-item>
          <vxe-form-item field="rank" title="排序" :span="12" :item-render="{}">
            <template #default="{ data }">
              <vxe-input
                type="number"
                min="0"
                v-model="data.rank"
                placeholder="请输入排序"
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

<style scoped>
.expand-wrapper {
  padding: 20px;
}
</style>
