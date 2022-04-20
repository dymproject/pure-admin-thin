<script setup lang="ts">
import { reactive } from "vue";
import { VxePagerEvents, VxeColumnProps } from "vxe-table";
import { getSecurities } from "/@/api/security";
import { spanEvent } from "/@/utils/vxeTable";

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
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "securityGroupName", title: "权限组" },
    { field: "name", title: "权限名称" },
    { field: "securityCode", title: "权限标识" },
    { field: "remark", title: "备注" }
  ] as VxeColumnProps[]
});

const getList = () => {
  getSecurities($pageOption.searchData).then((result: any) => {
    const { items } = result;
    const { totalCount } = result;
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
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="权限名称" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入权限名"
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
        :data="$pageOption.pagination.data"
        :span-method="spanEvent"
        :columns="$pageOption.gridColumns"
      >
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
  </div>
</template>

<style scoped></style>
