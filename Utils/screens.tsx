import FormCreate from "../Screens/FormCreate";
import FormList from "../Screens/FormList";
import FormViewer from "../Screens/FormViewer";
import UserCreate from "../Screens/UserCreate";

export const screens = [
  {
    name: 'Templates',
    title: 'Templates',
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
    name: 'FormCreate',
    title: 'Form Create',
    label: 'Create',
    component: FormCreate,
    requiredPermission: 1,
    icon: 'home',
    showInDrawer: false
  },
  {
    name: 'UserCreate',
    title: 'Create User',
    label: 'Create User',
    component: UserCreate,
    requiredPermission: 2,
    icon: 'file-document',
    showInDrawer: true
  },
]