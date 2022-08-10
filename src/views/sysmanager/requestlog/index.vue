<script setup lang="ts">
import { reactive } from "vue";
import { VxePagerEvents, VxeColumnProps } from "vxe-table";
import { getRequestLogs } from "/@/api/requestlog";

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
    { field: "controllerName", title: "控制器名称", width: 200 },
    { field: "actionmethodName", title: "操作名称", width: 200 },
    { field: "requestUrl", title: "请求地址", width: 300 },
    { field: "requestAction", title: "请求动作", width: 100 },
    {
      field: "requestSuccessed",
      title: "完成情况",
      width: 100,
      template: "tmp-success"
    },
    { field: "refererUrl", title: "来源地址", width: 300 },
    { field: "useragent", title: "浏览器标识", showOverflow: true, width: 200 },
    { field: "remoteIp", title: "客户端IP地址", width: 200 },
    { field: "environmentName", title: "运行环境", width: 200 },
    { field: "elapsedmilliseconds", title: "执行耗时", width: 100 },
    { field: "params", title: "请求参数信息", width: 200, showOverflow: true },
    { field: "response", title: "返回值", showOverflow: true, width: 200 },
    { field: "createTime", title: "请求时间", width: 150 },
    { field: "userName", title: "用户", width: 100 }
  ] as VxeColumnProps[]
});

const getList = () => {
  getRequestLogs($pageOption.searchData).then((result: any) => {
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
        <vxe-form-item title="用户名" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入用户名"
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
        :columns="$pageOption.gridColumns"
      >
        <template #tmp-success="{ row }">
          {{ row.requestSuccessed ? "是" : "否" }}
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
