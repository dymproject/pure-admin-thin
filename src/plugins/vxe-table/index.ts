import "xe-utils";
import { App } from "vue";
import "font-awesome/css/font-awesome.min.css";
import {
  // 核心
  VXETable,

  // 表格功能
  Header,
  Footer,
  Icon,
  Filter,
  Edit,
  Menu,
  Export,
  Keyboard,
  Validator,

  // 可选组件
  Column,
  Colgroup,
  Grid,
  Tooltip,
  Toolbar,
  Pager,
  Form,
  FormItem,
  FormGather,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  RadioButton,
  Switch,
  Input,
  Select,
  Optgroup,
  Option,
  Textarea,
  Button,
  Modal,
  List,
  Pulldown,

  // 表格
  Table
} from "vxe-table";

// 全局默认参数
VXETable.setup({
  size: "small",
  version: 0,
  zIndex: 1002,
  table: {
    border: true,
    round: true,
    // 自动监听父元素的变化去重新计算表格
    autoResize: true,
    // 鼠标移到行是否要高亮显示
    highlightHoverRow: true
  },
  pager: {
    autoHidden: false,
    perfect: true,
    layouts: [
      "Sizes",
      "PrevJump",
      "PrevPage",
      "Number",
      "NextPage",
      "NextJump",
      "FullJump",
      "Total"
    ]
  },
  icon: {
    // pager
    PAGER_JUMP_PREV: "fa fa-angle-double-left",
    PAGER_JUMP_NEXT: "fa fa-angle-double-right",
    PAGER_PREV_PAGE: "fa fa-angle-left",
    PAGER_NEXT_PAGE: "fa fa-angle-right",
    TABLE_TREE_OPEN: "fa fa-chevron-down",
    TABLE_TREE_CLOSE: "fa fa-chevron-right"
  },
  input: {
    clearable: true
  }
});

export function useTable(app: App) {
  app
    .use(Header)
    .use(Footer)
    .use(Icon)
    .use(Filter)
    .use(Edit)
    .use(Menu)
    .use(Export)
    .use(Keyboard)
    .use(Validator)

    // 可选组件
    .use(Column)
    .use(Colgroup)
    .use(Grid)
    .use(Tooltip)
    .use(Toolbar)
    .use(Pager)
    .use(Form)
    .use(FormItem)
    .use(FormGather)
    .use(Checkbox)
    .use(CheckboxGroup)
    .use(Radio)
    .use(RadioGroup)
    .use(RadioButton)
    .use(Switch)
    .use(Input)
    .use(Select)
    .use(Optgroup)
    .use(Option)
    .use(Textarea)
    .use(Button)
    .use(Modal)
    .use(List)
    .use(Pulldown)
    // 安装表格
    .use(Table);
}
