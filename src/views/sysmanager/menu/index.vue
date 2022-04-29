<script setup lang="ts">
import { reactive } from "vue";
import { VxePagerEvents, VxeColumnProps } from "vxe-table";
import { getMenus } from "/@/api/menu";
import { IconifyIconOffline } from "/@/components/ReIcon";

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
    { field: "title", title: "菜单名", treeNode: "true" },
    { field: "name", title: "菜单唯一Name" },
    {
      field: "icon",
      title: "图标",
      slots: {
        default: "icon_default"
      },
      width: 100
    },
    { field: "path", title: "路径" },
    { field: "redirect", title: "重定向" },
    { field: "query", title: "参数" }
  ] as VxeColumnProps[]
});

const getList = () => {
  getMenus($pageOption.searchData).then((result: any) => {
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
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="菜单名" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入菜单名"
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
          parentField: 'parentId'
        }"
        :data="$pageOption.pagination.data"
        :columns="$pageOption.gridColumns"
      >
        <template #icon_default="{ row }">
          <IconifyIconOffline :icon="row.icon" />
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
  </div>
</template>

<style scoped></style>
