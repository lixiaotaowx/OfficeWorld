# 成员列表压缩 · 2026-09-13

- 用户要求降低成员列表高度。
- directory-ui.css：每项由三行改为两行，编号与姓名同排；状态独立第二行，保留状态点。
- 行间距8px降至5px。workspace-responsive.css：桌面紧凑项46px、手机48px。
- 保留两列、360px桌面面板和九个工位；长姓名沿用省略，点击可在详情查看。
- 本地1280×720实测列表250px高，较此前桌面约361px少约111px；390×844实测260px。
- 桌面手机无横向溢出，老板工位点击后选中和详情更新正常。
- 截图Build/member-density-desktop.png、Build/member-density-mobile.png。
- 仅两个CSS修改，未改App、媒体或后端；已交助理基于最新发布统一构建部署。

## 上线核验
- 助理已发布BjC6acur/BTNZrnNF；本任务正式HTTPS浏览器实测列表250px、项高46px，加载BTNZrnNF样式。
- 线上九工位含老板、三人在线及共享中状态显示正常，真实线上截图已查看。
- TypeScript和生产构建通过，两个修改文件均不足500行。
