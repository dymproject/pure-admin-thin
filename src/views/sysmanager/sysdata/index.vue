<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  VxePagerEvents,
  VxeColumnProps,
  VXETable,
  VxeTablePropTypes
} from "vxe-table";
import {
  submitCategory,
  deleteCategory,
  getCategories,
  submitCateData,
  getCategoriyData,
  deleteCategoryData
} from "/@/api/sysdata";
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
    { type: "seq", title: "序号", width: 50, align: "center" },
    {
      type: "expand",
      title: "#",
      width: 50,
      align: "center",
      slots: { content: "content" }
    },
    { field: "name", title: "字典分类名", treeNode: "true" },
    { field: "categoryCode", title: "字典编码" },
    {
      field: "operate",
      align: "center",
      width: 250,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[],
  cateDataColumns: [
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "label", title: "字典标签", treeNode: "true" },
    { field: "value", title: "字典值" },
    {
      field: "operate",
      align: "center",
      width: 250,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[],
  categoryFromData: {
    id: 0,
    name: "",
    categoryCode: ""
  },
  cateDataFromData: {
    id: 0,
    label: "",
    value: ""
  },
  infoOption: {
    showCategoryModal: false,
    showCateDataModal: false,
    submitLoading: false,
    selectRow: null,
    categoryId: null
  },
  categoryFormRule: {
    name: [{ required: true, message: "请输入字典名" }],
    categoryCode: [{ required: true, message: "请输入字典编码" }]
  },
  cateDataFormRule: {
    label: [{ required: true, message: "请输入字典标签" }],
    value: [{ required: true, message: "请输入字典值" }]
  }
});

const getList = () => {
  getCategories($pageOption.searchData).then((result: any) => {
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
  $pageOption.categoryFromData = {
    id: 0,
    name: "",
    categoryCode: ""
  };
  $pageOption.infoOption.selectRow = null;
  $pageOption.infoOption.showCategoryModal = true;
};
const editEvent = (row: any) => {
  $pageOption.categoryFromData = {
    id: row.id,
    name: row.name,
    categoryCode: row.categoryCode
  };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.showCategoryModal = true;
};
const editCateDataEvent = (row: any) => {
  $pageOption.cateDataFromData = {
    id: row.id,
    label: row.label,
    value: row.value
  };
  $pageOption.infoOption.showCateDataModal = true;
};
const addCategoryDataEvent = (row: any) => {
  $pageOption.cateDataFromData = { id: 0, label: "", value: "" };
  $pageOption.infoOption.selectRow = row;
  $pageOption.infoOption.categoryId = row.id;
  $pageOption.infoOption.showCateDataModal = true;
};
const submitEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitCategory($pageOption.categoryFromData)
    .then(() => {
      $pageOption.infoOption.submitLoading = false;
      $pageOption.infoOption.showCategoryModal = false;
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
    deleteCategory(row.id)
      .then(() => {
        VXETable.modal.message({ content: "删除成功", status: "success" });
        getList();
      })
      .catch(() => {
        VXETable.modal.message({ content: "删除失败", status: "error" });
      });
  }
};
const deleteCateDataEvent = async (row: any) => {
  const type = await VXETable.modal.confirm("您确定要删除吗？");
  if (type == "confirm") {
    deleteCategoryData(row.id)
      .then(() => {
        VXETable.modal.message({ content: "删除成功", status: "success" });
        getList();
      })
      .catch(() => {
        VXETable.modal.message({ content: "删除失败", status: "error" });
      });
  }
};
const submitCateDataEvent = () => {
  $pageOption.infoOption.submitLoading = true;
  submitCateData(
    $pageOption.infoOption.categoryId,
    $pageOption.cateDataFromData
  )
    .then(() => {
      $pageOption.infoOption.submitLoading = false;
      $pageOption.infoOption.showCateDataModal = false;
      VXETable.modal.message({ content: "保存成功", status: "success" });
      getList();
    })
    .catch(() => {
      $pageOption.infoOption.submitLoading = false;
    });
};
const tableExpand = ref({
  lazy: true,
  iconClose: "fa fa-plus",
  iconOpen: "fa fa-minus",
  loadMethod({ row }) {
    console.log(row);
    row.childData = [];
    return new Promise(resolve => {
      getCategoriyData(row.id).then((cateData: any) => {
        row.childData = cateData;
      });
      resolve();
    });
  }
} as VxeTablePropTypes.ExpandConfig);
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="字典分类名" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入分类名"
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
          parentField: 'categoryId'
        }"
        :expand-config="tableExpand"
        :data="$pageOption.pagination.data"
        :columns="$pageOption.gridColumns"
      >
        <template #content="{ row }">
          <div class="expand-wrapper">
            <vxe-grid
              size="mini"
              :columns="$pageOption.cateDataColumns"
              :data="row.childData"
            >
              <template #operate="{ row }">
                <vxe-button
                  icon="fa fa-edit"
                  title="修改"
                  size="mini"
                  status="warning"
                  content="修改"
                  v-auth="sysdataSecurity.edit"
                  @click="editCateDataEvent(row)"
                />
                <vxe-button
                  icon="fa fa-trash"
                  title="删除"
                  size="mini"
                  status="danger"
                  content="删除"
                  v-auth="sysdataSecurity.delete"
                  @click="deleteCateDataEvent(row)"
                />
              </template>
            </vxe-grid>
          </div>
        </template>
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
            v-auth="sysdataSecurity.delete"
            @click="deleteEvent(row)"
          />
          <vxe-button
            icon="fa fa-plus"
            title="增加分类数据"
            circle
            @click="addCategoryDataEvent(row)"
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
      v-model="$pageOption.infoOption.showCategoryModal"
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
          :data="$pageOption.categoryFromData"
          :rules="$pageOption.categoryFormRule"
          title-align="right"
          title-width="100"
          @submit="submitEvent"
        >
          <vxe-form-item
            field="name"
            title="字典名"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="请输入字典名" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="categoryCode"
            title="分类编码"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input
                v-model="data.categoryCode"
                placeholder="请输入分类编码"
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
      v-model="$pageOption.infoOption.showCateDataModal"
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
          :data="$pageOption.cateDataFromData"
          :rules="$pageOption.cateDataFormRule"
          title-align="right"
          title-width="100"
          @submit="submitCateDataEvent"
        >
          <vxe-form-item
            field="label"
            title="字典标签"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.label" placeholder="请输入字典标签" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="value"
            title="字典值"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.value" placeholder="请输入字典值" />
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
