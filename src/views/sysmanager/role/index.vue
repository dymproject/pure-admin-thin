<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  VxeTableInstance,
  VxePagerEvents,
  VxeColumnProps,
  VxeFormPropTypes,
  VXETable
} from "vxe-table";
import { spanEvent } from "/@/utils/vxeTable";
import { roleSecurity } from "/@/views/securitycode";
import { ElMessage, TabsPaneContext } from "element-plus";
import {
  submitRole,
  getRoles,
  deleteRole,
  getUserList,
  bindUser,
  unbindUser,
  getRoleSecurities,
  getRoleMenus
} from "/@/api/role";

import { getAllSecurity, giveRoleSecurities } from "/@/api/security";

import { getAllMenu, giveRoleMenus } from "/@/api/menu";

const enum bindType {
  bind,
  unbind
}
const xGridUser = ref({} as VxeTableInstance);
const xGridSecurity = ref({} as VxeTableInstance);
const xGridMenu = ref({} as VxeTableInstance);
defineExpose({
  xGridUser,
  xGridSecurity,
  xGridMenu
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
  infoModal: {
    showModal: false,
    submitLoading: false,
    selectRow: null
  },
  formData: {
    id: 0,
    name: "",
    remark: ""
  },
  formRules: {
    name: [{ required: true, message: "请输入角色名" }]
  } as VxeFormPropTypes.Rules,
  gridColumns: [
    { type: "seq", title: "序号", width: 50, align: "center" },
    { field: "name", title: "角色名称" },
    { field: "remark", title: "角色描述" },
    {
      field: "operate",
      align: "center",
      width: 150,
      title: "操作",
      slots: { default: "operate" }
    }
  ] as VxeColumnProps[],
  giveAuthModal: {
    showModal: false,
    tabsValue: "",
    title: "角色授权->"
  },
  tabsOption: {
    gridLoading: false,
    selectRecords: [],
    roleId: 0,
    userSearchData: {
      name: "",
      account: "",
      isBind: true,
      pageSize: 20,
      pageIndex: 1
    },
    pagination: {
      total: 0,
      data: []
    },
    securitySearchData: {
      name: ""
    },
    menuSearchData: {
      name: ""
    },
    securityData: [],
    menuData: [],
    userGridColumns: [
      // { type: "seq", title: "序号", width: 50, align: "center" },
      { type: "checkbox", width: 50, align: "center" },
      { field: "name", title: "姓名" },
      { field: "telephone", title: "电话" },
      { field: "email", title: "邮箱" },
      { field: "account", title: "账号" },
      {
        field: "operate",
        align: "center",
        width: 150,
        title: "操作",
        slots: { default: "operate" }
      }
    ] as VxeColumnProps[],
    securityGridColumns: [
      { type: "checkbox", width: 50, align: "center" },
      { field: "securityGroupName", title: "权限组" },
      { field: "name", title: "权限名称" },
      { field: "securityCode", title: "权限标识", width: 300 },
      { field: "remark", title: "备注", showOverflow: true }
    ] as VxeColumnProps[],
    menuGridColumns: [
      { type: "checkbox", width: 100, align: "center", treeNode: "true" },
      { field: "title", title: "菜单名" },
      { field: "name", title: "菜单唯一Name" },
      { field: "icon", title: "图标" },
      { field: "path", title: "路径", showOverflow: true },
      { field: "redirect", title: "重定向", showOverflow: true },
      { field: "query", title: "参数", showOverflow: true }
    ] as VxeColumnProps[]
  }
});

const getList = () => {
  getRoles($pageOption.searchData).then((result: any) => {
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
    remark: ""
  };
  $pageOption.infoModal.selectRow = null;
  $pageOption.infoModal.showModal = true;
};
const editEvent = (row: any) => {
  $pageOption.formData = {
    id: row.id,
    name: row.name,
    remark: row.remark
  };
  $pageOption.infoModal.selectRow = row;
  $pageOption.infoModal.showModal = true;
};
const submitEvent = () => {
  $pageOption.infoModal.submitLoading = true;
  submitRole($pageOption.formData)
    .then(() => {
      $pageOption.infoModal.submitLoading = false;
      $pageOption.infoModal.showModal = false;
      VXETable.modal.message({ content: "保存成功", status: "success" });
      getList();
    })
    .catch(() => {
      $pageOption.infoModal.submitLoading = false;
    });
};
const deleteEvent = async (row: any) => {
  const type = await VXETable.modal.confirm("您确定要删除吗？");
  if (type == "confirm") {
    let param = { rowid: row.id };
    deleteRole(param)
      .then(() => {
        VXETable.modal.message({ content: "删除成功", status: "success" });
        getList();
      })
      .catch(() => {
        VXETable.modal.message({ content: "删除失败", status: "error" });
      });
  }
};

const giveAuthEvent = (row: any) => {
  $pageOption.giveAuthModal.showModal = true;
  $pageOption.giveAuthModal.title += row.name;
  $pageOption.giveAuthModal.tabsValue = "user";
  $pageOption.tabsOption.roleId = row.id;
  $pageOption.tabsOption.userSearchData.name = "";
  $pageOption.tabsOption.userSearchData.account = "";
  $pageOption.tabsOption.userSearchData.isBind = true;
  queryUser();
};

const queryUser = () => {
  $pageOption.tabsOption.gridLoading = true;
  //加载用户
  getUserList(
    $pageOption.tabsOption.roleId,
    $pageOption.tabsOption.userSearchData
  )
    .then((result: any) => {
      const { items, totalCount } = result;
      $pageOption.tabsOption.pagination.data = items;
      $pageOption.tabsOption.pagination.total = totalCount;
    })
    .finally(() => {
      $pageOption.tabsOption.gridLoading = false;
    });
};

const tabsChangeEvent = (tab: TabsPaneContext) => {
  if (tab.paneName == "security") {
    queryAllSecurity();
  } else if (tab.paneName == "menu") {
    queryAllmenu();
  }
};
const userTabPageChangeEvent: VxePagerEvents.PageChange = ({
  currentPage,
  pageSize
}) => {
  $pageOption.tabsOption.userSearchData.pageIndex = currentPage;
  $pageOption.searchData.pageSize = pageSize;
  queryUser();
};

const userOperateEvent = (operate: bindType, row: any) => {
  $pageOption.tabsOption.selectRecords = [];
  if (row) {
    $pageOption.tabsOption.selectRecords.push(row);
  } else {
    const selectRecords = xGridUser.value.getCheckboxRecords(false);
    $pageOption.tabsOption.selectRecords = selectRecords;
  }
  batchOperateUser(operate);
};

const batchOperateUser = (operate: bindType) => {
  const userIds = Array.from($pageOption.tabsOption.selectRecords, x => x.id);
  if (operate == bindType.bind) {
    bindUser($pageOption.tabsOption.roleId, userIds).then(() => {
      ElMessage.success("绑定成功");
      queryUser();
    });
  } else {
    unbindUser($pageOption.tabsOption.roleId, userIds).then(() => {
      ElMessage.success("解绑成功");
      queryUser();
    });
  }
};

const queryAllSecurity = () => {
  $pageOption.tabsOption.gridLoading = true;
  xGridSecurity.value.clearCheckboxRow();
  getAllSecurity($pageOption.tabsOption.securitySearchData)
    .then((data: any) => {
      $pageOption.tabsOption.securityData = data;
      getRoleSecurities($pageOption.tabsOption.roleId).then(
        (roleSecurityData: any) => {
          let checkedRows = [];
          roleSecurityData.forEach(rs => {
            const checkedRow = data.find(x => x.id == rs.id);
            if (checkedRow) {
              checkedRows.push(checkedRow);
            }
          });
          xGridSecurity.value.setCheckboxRow(checkedRows, true);
        }
      );
    })
    .finally(() => {
      $pageOption.tabsOption.gridLoading = false;
    });
};
const saveRoleSecurity = () => {
  const checkRows = xGridSecurity.value.getCheckboxRecords();
  const securityIds = Array.from(checkRows, x => x.id);
  giveRoleSecurities($pageOption.tabsOption.roleId, securityIds).then(() => {
    ElMessage.success("保存成功");
  });
};

const queryAllmenu = () => {
  $pageOption.tabsOption.gridLoading = true;
  getAllMenu($pageOption.tabsOption.menuSearchData)
    .then((data: any) => {
      $pageOption.tabsOption.menuData = data;
      getRoleMenus($pageOption.tabsOption.roleId).then((roleMenuData: any) => {
        console.log(roleMenuData);
        let checkedRows = [];
        roleMenuData.forEach(rs => {
          const checkedRow = data.find(
            x => x.id == rs.id && x.parentId != null
          );
          if (checkedRow) {
            checkedRows.push(checkedRow);
          }
        });
        xGridMenu.value.setCheckboxRow(checkedRows, true);
      });
    })
    .finally(() => {
      $pageOption.tabsOption.gridLoading = false;
    });
};
const saveRoleMenu = () => {
  const checkRows = xGridMenu.value.getCheckboxRecords();
  const halfCheckRows = xGridMenu.value.getCheckboxIndeterminateRecords();
  const menuIds = Array.from(checkRows.concat(halfCheckRows), x => x.id);
  giveRoleMenus($pageOption.tabsOption.roleId, menuIds).then(() => {
    ElMessage.success("保存成功");
  });
};
</script>

<template>
  <div>
    <el-card>
      <vxe-form :data="$pageOption.searchData" @submit="getList">
        <vxe-form-item title="角色名称" field="name" :item-render="{}">
          <template #default="{ data }">
            <vxe-input
              v-model="data.name"
              placeholder="请输入角色名"
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
            v-auth="roleSecurity.add"
            @click="insertEvent"
          />
        </template>
      </vxe-toolbar>
      <vxe-grid
        ref="xGrid"
        :height="650"
        :data="$pageOption.pagination.data"
        :columns="$pageOption.gridColumns"
      >
        <template #operate="{ row }">
          <vxe-button
            icon="fa fa-edit"
            title="修改"
            circle
            v-auth="roleSecurity.edit"
            @click="editEvent(row)"
          />
          <vxe-button
            icon="fa fa-trash"
            title="删除"
            circle
            v-auth="roleSecurity.delete"
            @click="deleteEvent(row)"
          />
          <vxe-button
            icon="fa fa-recycle"
            title="授权"
            circle
            @click="giveAuthEvent(row)"
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
      v-model="$pageOption.infoModal.showModal"
      :title="
        $pageOption.infoModal.selectRow
          ? '编辑数据->' + $pageOption.infoModal.selectRow.name
          : '新增数据'
      "
      width="800"
      min-width="600"
      min-height="300"
      :loading="$pageOption.infoModal.submitLoading"
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
            title="角色名"
            :span="12"
            :item-render="{}"
          >
            <template #default="{ data }">
              <vxe-input v-model="data.name" placeholder="请输入角色名" />
            </template>
          </vxe-form-item>
          <vxe-form-item
            field="remark"
            title="角色描述"
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
    <!--授权modal-->
    <vxe-modal
      v-model="$pageOption.giveAuthModal.showModal"
      width="800"
      :title="$pageOption.giveAuthModal.title"
      min-height="400"
    >
      <el-tabs
        v-model="$pageOption.giveAuthModal.tabsValue"
        class="demo-tabs"
        @tab-click="tabsChangeEvent"
      >
        <el-tab-pane label="用户" name="user">
          <vxe-form
            id="userQueryForm"
            form="userQueryForm"
            :data="$pageOption.tabsOption.userSearchData"
            @submit="queryUser"
          >
            <vxe-form-item title="姓名" field="name" :item-render="{}">
              <template #default="{ data }">
                <vxe-input
                  v-model="data.name"
                  placeholder="请输入姓名"
                  clearable
                />
              </template>
            </vxe-form-item>
            <vxe-form-item title="账号" field="account" :item-render="{}">
              <template #default="{ data }">
                <vxe-input v-model="data.account" placeholder="请输入账号" />
              </template>
            </vxe-form-item>
            <vxe-form-item :item-render="{}">
              <template #default="{}">
                <vxe-checkbox
                  v-model="$pageOption.tabsOption.userSearchData.isBind"
                  @change="queryUser"
                  content="绑定的用户"
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
              </template>
            </vxe-form-item>
          </vxe-form>
          <vxe-toolbar>
            <template #buttons>
              <vxe-button
                icon="fa fa-plus"
                status="success"
                content="绑定"
                v-auth="roleSecurity.bindUser"
                v-if="!$pageOption.tabsOption.userSearchData.isBind"
                @click="userOperateEvent(bindType.bind)"
              />
              <vxe-button
                icon="fa fa-trash"
                status="warning"
                content="解绑"
                v-auth="roleSecurity.unbindUser"
                v-if="$pageOption.tabsOption.userSearchData.isBind"
                @click="userOperateEvent(bindType.unbind)"
              />
            </template>
          </vxe-toolbar>
          <vxe-grid
            ref="xGridUser"
            :height="650"
            :loading="$pageOption.tabsOption.gridLoading"
            :data="$pageOption.tabsOption.pagination.data"
            :columns="$pageOption.tabsOption.userGridColumns"
          >
            <template #operate="{ row }">
              <vxe-button
                icon="fa fa-plus"
                title="绑定"
                circle
                v-auth="roleSecurity.bindUser"
                v-if="!$pageOption.tabsOption.userSearchData.isBind"
                @click="userOperateEvent(bindType.bind, row)"
              />
              <vxe-button
                icon="fa fa-trash"
                title="解绑"
                circle
                v-auth="roleSecurity.unbindUser"
                v-if="$pageOption.tabsOption.userSearchData.isBind"
                @click="userOperateEvent(bindType.unbind, row)"
              />
            </template>
            <template #pager>
              <vxe-pager
                v-model:current-page="
                  $pageOption.tabsOption.userSearchData.pageIndex
                "
                v-model:page-size="
                  $pageOption.tabsOption.userSearchData.pageSize
                "
                :total="$pageOption.tabsOption.pagination.total"
                @page-change="userTabPageChangeEvent"
              />
            </template>
          </vxe-grid>
        </el-tab-pane>
        <el-tab-pane label="权限" name="security">
          <vxe-form
            id="securityForm"
            :data="$pageOption.tabsOption.securitySearchData"
            @submit="queryAllSecurity"
          >
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
                  icon="fa fa-save"
                  type="button"
                  status="warning"
                  content="保存"
                  @click="saveRoleSecurity"
                />
              </template>
            </vxe-form-item>
          </vxe-form>
          <vxe-grid
            ref="xGridSecurity"
            :height="650"
            :loading="$pageOption.tabsOption.gridLoading"
            :data="$pageOption.tabsOption.securityData"
            :span-method="spanEvent"
            :columns="$pageOption.tabsOption.securityGridColumns"
          />
        </el-tab-pane>
        <el-tab-pane label="菜单" name="menu">
          <vxe-form
            id="menuFrom"
            :data="$pageOption.tabsOption.menuSearchData"
            @submit="queryAllmenu"
          >
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
                  icon="fa fa-save"
                  type="button"
                  status="warning"
                  content="保存"
                  @click="saveRoleMenu"
                />
              </template>
            </vxe-form-item>
          </vxe-form>
          <vxe-grid
            ref="xGridMenu"
            :height="650"
            :show-overflow="true"
            :loading="$pageOption.tabsOption.gridLoading"
            :tree-config="{
              transform: true,
              rowField: 'id',
              parentField: 'parentId'
            }"
            :data="$pageOption.tabsOption.menuData"
            :columns="$pageOption.tabsOption.menuGridColumns"
          />
        </el-tab-pane>
      </el-tabs>
    </vxe-modal>
  </div>
</template>

<style scoped></style>
