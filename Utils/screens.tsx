import FormCreate from "../Screens/FormCreate";
import FormList from "../Screens/FormList";
import FormViewer from "../Screens/FormViewer";
import Login from "../Screens/Login";

export const screens = [
  {
    name: 'FormList',
    title: 'Form List',
    label: 'List',
    component: FormList,
    requiredPermission: 0,
    icon: 'home',
    showInDrawer: true
  },
  {
    name: 'FormViewer',
    title: 'Form Viewer',
    label: 'View',
    component: FormViewer,
    requiredPermission: 0,
    icon: 'home',
    showInDrawer: false
  },
  {
    name: 'Form Create',
    title: 'Form Create',
    label: 'Create',
    component: FormCreate,
    requiredPermission: 2,
    icon: 'home',
    showInDrawer: true
  },
]