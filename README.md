# 熊猫的小家

为家人制作的宠物互动小家。手机通过网页打开，包含熊猫的互动动作、照片和录像。

## 使用

网页入口为 `index.html`，小家的插画、动作和互动脚本保留在主页内。
相册由 `album.html` 和 `album/` 文件夹独立提供，点击相册后才加载；关闭相册会回到原来的小家场景。
媒体展示区保持固定，左右滑动切换，关闭按钮左侧显示“滑动切换”；已取消全屏和翻页按钮。录像先显示封面，点击播放后才播放，声音使用录像自带的控件。
照片和录像按原画质保存在 `album/media/`，内容顺序、标题和日期在 `album/content.js` 维护，详见 [相册维护说明](album/README.md)。
所有文件由本站提供，不依赖外部资源服务。本地使用时请保留整个目录结构，单独复制 `index.html` 不会带上相册。
HTTPS 发布后可直接在手机浏览器访问；实际鸿蒙兼容性仍需在目标手机确认。

## 发布到 GitHub Pages

本项目已经通过 GitHub Pages 发布：

- 网页入口：https://yrongzh.github.io/xiongmao/
- 权利声明：https://yrongzh.github.io/xiongmao/rights.html

当前发布源为 `main` 分支的 **/(root)** 目录，并已启用 HTTPS。以后更新
`main` 中的 `index.html` 等文件后，GitHub Pages 会自动重新部署；部署状态可在
仓库的 **Settings → Pages** 中查看。

相册拆分后的发布文件包括 `index.html`、`album.html` 和整个 `album/` 文件夹。
`相册拆分/` 是本地备份与验证记录，不需要发布。提交或推送前应按用户要求完成设备确认。

## 权利说明

**All Rights Reserved / 保留所有权利**，详见 [LICENSE](LICENSE)。
允许浏览、体验本网页；未经相关权利人许可，不授权提取、转载、改编或再利用
照片、录像、宠物图像、动画素材及其他项目内容。内嵌与独立保存的媒体同样适用。

这不是 MIT、Apache、GPL 或 Creative Commons 等开放许可。
依法允许的使用及 GitHub 服务条款要求的平台内查看、Fork 权利不受影响。
公开可见与可 Fork 不代表获得额外再利用许可；本声明不能技术性阻止下载或截图。

参考：[GitHub 许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
和 [GitHub Pages 发布设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。
