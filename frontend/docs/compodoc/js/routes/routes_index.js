var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"routes","filename":"src/app/app-routing.module.ts","module":"AppRoutingModule","children":[{"path":"","redirectTo":"r/route-dispatcher","pathMatch":"full"},{"path":"r","component":"AppRootComponent","children":[{"path":"","redirectTo":"route-dispatcher","pathMatch":"full"},{"path":"login","redirectTo":"route-dispatcher","pathMatch":"full"},{"path":"login/:returnTo","component":"LoginComponent"},{"path":"check-starter","component":"SysCheckStarterComponent"},{"path":"test-starter","component":"TestStarterComponent","canActivate":["TestComponentActivateGuard"]},{"path":"admin-starter","component":"AdminStarterComponent","canActivate":["AdminOrSuperAdminComponentActivateGuard"]},{"path":"route-dispatcher","component":"RouteDispatcherComponent","canActivate":["RouteDispatcherActivateGuard"]},{"path":"code-input","component":"CodeInputComponent","canActivate":["CodeInputComponentActivateGuard"]},{"path":"monitor-starter","component":"MonitorStarterComponent","canActivate":["GroupMonitorActivateGuard"]}]},{"path":"legal-notice","component":"LegalNoticeComponent"},{"path":"check","loadChildren":"./sys-check/sys-check.module#SysCheckModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/sys-check/sys-check-routing.module.ts","module":"SysCheckRoutingModule","children":[{"path":":workspace-id/:sys-check-name","component":"SysCheckComponent","children":[{"path":"","redirectTo":"w","pathMatch":"full"},{"path":"w","component":"WelcomeComponent"},{"path":"n","component":"NetworkCheckComponent","canActivate":["SysCheckChildCanActivateGuard"]},{"path":"q","component":"QuestionnaireComponent","canActivate":["SysCheckChildCanActivateGuard"]},{"path":"r","component":"ReportComponent","canActivate":["SysCheckChildCanActivateGuard"]},{"path":"u","component":"UnitCheckComponent","canActivate":["SysCheckChildCanActivateGuard"]}]}],"kind":"module"}],"module":"SysCheckModule"}]},{"path":"admin","loadChildren":"./workspace-admin/workspace.module#WorkspaceModule","canActivate":["AdminComponentActivateGuard"],"children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/workspace-admin/workspace-routing.module.ts","module":"WorkspaceRoutingModule","children":[{"path":":ws","component":"WorkspaceComponent","children":[{"path":"","redirectTo":"monitor","pathMatch":"full"},{"path":"files","component":"FilesComponent"},{"path":"syscheck","component":"SyscheckComponent"},{"path":"results","component":"ResultsComponent"},{"path":"**","component":"FilesComponent"}]}],"kind":"module"}],"module":"WorkspaceModule"}]},{"path":"superadmin","loadChildren":"./superadmin/superadmin.module#SuperadminModule","canActivate":["SuperAdminComponentActivateGuard"],"children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/superadmin/superadmin-routing.module.ts","module":"SuperadminRoutingModule","children":[{"path":"","component":"SuperadminComponent","children":[{"path":"","redirectTo":"users","pathMatch":"full"},{"path":"users","component":"UsersComponent"},{"path":"workspaces","component":"WorkspacesComponent"},{"path":"settings","component":"SettingsComponent"},{"path":"**","component":"UsersComponent"}]}],"kind":"module"}],"module":"SuperadminModule"}]},{"path":"gm","loadChildren":"./group-monitor/group-monitor.module#GroupMonitorModule","children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/group-monitor/group-monitor-routing.module.ts","module":"GroupMonitorRoutingModule","children":[{"path":":group-name","component":"GroupMonitorComponent"}],"kind":"module"}],"module":"GroupMonitorModule"}]},{"path":"t","loadChildren":"./test-controller/test-controller.module#TestControllerModule","canActivate":["TestComponentActivateGuard"],"children":[{"kind":"module","children":[{"name":"routes","filename":"src/app/test-controller/routing/test-controller-routing.module.ts","module":"TestControllerRoutingModule","children":[{"path":":t","component":"TestControllerComponent","canDeactivate":["TestControllerDeactivateGuard"],"children":[{"path":"","redirectTo":"status","pathMatch":"full"},{"path":"status","component":"TestStatusComponent"},{"path":"u/:u","component":"UnithostComponent","canActivate":["TestControllerErrorPausedActivateGuard","UnitActivateGuard"],"canDeactivate":["UnitDeactivateGuard"]}]}],"kind":"module"}],"module":"TestControllerModule"}]},{"path":"**","component":"RouteDispatcherComponent","canActivate":["DirectLoginActivateGuard"]}],"kind":"module"}]}
