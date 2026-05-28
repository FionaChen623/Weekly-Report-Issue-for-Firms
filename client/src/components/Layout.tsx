import { ActiveLink } from '@lark-apaas/client-toolkit/components/ActiveLink';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboardIcon,
  CheckSquareIcon,
  FileTextIcon,
  UsersIcon,
  BellIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  ChevronUpIcon,
  MenuIcon,
  BarChart3Icon,
  CrownIcon,
  ShieldIcon,
  UserCogIcon,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUserProfile } from '@lark-apaas/client-toolkit/hooks/useCurrentUserProfile';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { UserRole, RoleView } from '@/types';
import { useNavigate } from 'react-router-dom';

// 模拟当前用户角色 - 实际应从后端获取
const currentUserRole: UserRole = 'admin'; // 可切换: 'admin' | 'leader' | 'member'
const currentUserGroupId: string | null = null; // admin为null, leader/member有值

// Admin 导航项
const adminNavItems = [
  { path: '/admin', label: '仪表盘', icon: LayoutDashboardIcon },
  { path: '/admin/tasks', label: '任务管理', icon: CheckSquareIcon },
  { path: '/admin/reports', label: '周报审核', icon: FileTextIcon },
  { path: '/admin/groups', label: '分组管理', icon: UsersIcon },
  { path: '/admin/settings/reminders', label: '提醒设置', icon: BellIcon },
];

// Leader 导航项
const leaderNavItems = [
  { path: '/leader', label: '组仪表盘', icon: LayoutDashboardIcon },
  { path: '/leader/my-reports', label: '我的周报', icon: FileTextIcon },
  { path: '/leader/my-tasks', label: '我的任务', icon: CheckSquareIcon },
  { path: '/leader/team-reports', label: '组员周报', icon: UsersIcon },
  { path: '/leader/team-tasks', label: '组任务管理', icon: CheckSquareIcon },
  { path: '/leader/members', label: '组成员', icon: UsersIcon },
];

// Member 导航项 (Topbar)
const memberNavItems = [
  { path: '/', label: '我的周报', icon: FileTextIcon },
  { path: '/tasks', label: '我的任务', icon: CheckSquareIcon },
  { path: '/settings', label: '设置', icon: SettingsIcon },
];

const handleLogout = async () => {
  const dataloom = await getDataloom();
  await dataloom.service.session.signOut();
  window.location.reload();
};

// 角色选择器组件
function RoleSwitcher({ currentRole, onRoleChange }: { currentRole: RoleView; onRoleChange: (role: RoleView) => void }) {
  const roleConfig = {
    admin: { label: '管理员', icon: ShieldIcon, color: 'text-primary' },
    leader: { label: '组长', icon: UserCogIcon, color: 'text-warning' },
    member: { label: '员工', icon: UserIcon, color: 'text-success' },
  };

  const config = roleConfig[currentRole];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <config.icon className={`size-4 ${config.color}`} />
          <span>{config.label}视图</span>
          <ChevronUpIcon className="size-3 rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>切换角色视图</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onRoleChange('admin')} className={currentRole === 'admin' ? 'bg-accent' : ''}>
          <ShieldIcon className="mr-2 size-4 text-primary" />
          <span>管理员</span>
          {currentRole === 'admin' && <Badge variant="secondary" className="ml-auto text-xs">当前</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoleChange('leader')} className={currentRole === 'leader' ? 'bg-accent' : ''}>
          <UserCogIcon className="mr-2 size-4 text-warning" />
          <span>组长</span>
          {currentRole === 'leader' && <Badge variant="secondary" className="ml-auto text-xs">当前</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onRoleChange('member')} className={currentRole === 'member' ? 'bg-accent' : ''}>
          <UserIcon className="mr-2 size-4 text-success" />
          <span>员工</span>
          {currentRole === 'member' && <Badge variant="secondary" className="ml-auto text-xs">当前</Badge>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Admin Sidebar
function AdminSidebar({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();
  const userInfo = useCurrentUserProfile();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <CrownIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">周报系统</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">管理端</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* 角色切换器 */}
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <RoleSwitcher currentRole="admin" onRoleChange={onRoleChange} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">功能菜单</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={pathname === item.path} tooltip={item.label}>
                    <Link to={item.path}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserIcon className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">{'陈昱霏'}</span>
                  <ChevronUpIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 size-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Leader Sidebar
function LeaderSidebar({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();
  const userInfo = useCurrentUserProfile();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/leader">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-warning text-white">
                  <UserCogIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">周报系统</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">组长端</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* 角色切换器 */}
        <div className="px-2 py-2 group-data-[collapsible=icon]:hidden">
          <RoleSwitcher currentRole="leader" onRoleChange={onRoleChange} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">组管理</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {leaderNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={pathname === item.path} tooltip={item.label}>
                    <Link to={item.path}>
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <UserIcon className="size-4" />
                  <span className="group-data-[collapsible=icon]:hidden">{'陈昱霏'}</span>
                  <ChevronUpIcon className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 size-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Member Topbar
function MemberTopbar({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();
  const userInfo = useCurrentUserProfile();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 mr-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileTextIcon className="size-4" />
          </div>
          <span className="font-semibold text-foreground">周报系统</span>
        </div>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto">
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-1 mt-4">
                {memberNavItems.map((item) => (
                  <ActiveLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`
                    }
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </ActiveLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center gap-1">
            {memberNavItems.map((item) => (
              <ActiveLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <item.icon className="size-4" />
                <span>{item.label}</span>
              </ActiveLink>
            ))}
          </nav>
        )}

        {!isMobile && (
          <div className="ml-auto flex items-center gap-2">
            {/* 角色切换器 - 仅开发测试用 */}
            <RoleSwitcher currentRole="member" onRoleChange={onRoleChange} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="size-4" />
                  <span>{'陈昱霏'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon className="mr-2 size-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

// Admin Layout
function AdminLayout({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SidebarProvider>
      <AdminSidebar onRoleChange={onRoleChange} />
      <main className="flex-1 min-w-0 py-8 px-6">
        <header className="flex items-center gap-2 mb-6">
          <SidebarTrigger />
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

// Leader Layout
function LeaderLayout({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <SidebarProvider>
      <LeaderSidebar onRoleChange={onRoleChange} />
      <main className="flex-1 min-w-0 py-8 px-6">
        <header className="flex items-center gap-2 mb-6">
          <SidebarTrigger />
        </header>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

// Member Layout
function MemberLayout({ onRoleChange }: { onRoleChange: (role: RoleView) => void }) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <MemberTopbar onRoleChange={onRoleChange} />
      <main className="flex-1 py-8 px-4 md:px-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}

// 主 Layout 组件
const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentView, setCurrentView] = useState<RoleView>(currentUserRole);

  // 根据路径或用户角色决定当前视图
  const isAdminRoute = pathname.startsWith('/admin');
  const isLeaderRoute = pathname.startsWith('/leader');
  const isMemberRoute = !isAdminRoute && !isLeaderRoute;

  // 处理角色切换 - 导航到对应路由
  const handleRoleChange = (role: RoleView) => {
    setCurrentView(role);
    // 根据角色导航到对应首页
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'leader':
        navigate('/leader');
        break;
      case 'member':
        navigate('/');
        break;
    }
  };

  // 根据当前路由决定渲染哪个布局
  if (isAdminRoute) {
    return <AdminLayout onRoleChange={handleRoleChange} />;
  }

  if (isLeaderRoute) {
    return <LeaderLayout onRoleChange={handleRoleChange} />;
  }

  return <MemberLayout onRoleChange={handleRoleChange} />;
};

export default Layout;
