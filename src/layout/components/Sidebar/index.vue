<template>
  <div :class="{'has-logo':showLogo}" class="my-menu">
    <logo v-if="showLogo" :collapse="isCollapse" />
    <el-scrollbar wrap-class="scrollbar-wrapper" :class="{isOpenCollapseMenu: !isCollapse}" :style="{width: !isCollapse && subMenu && subMenu.length > 1 ? '200%' : '100%'}">
      <div class="main-menu">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :background-color="variables.menuBg"
          :text-color="variables.menuText"
          :unique-opened="true"
          :active-text-color="variables.menuActiveText"
          :collapse-transition="true"
          mode="vertical"
        >
          <sidebar-item v-for="route in permission_routes" :key="route.path" :item="route" :base-path="route.path" />
        </el-menu>
      </div>
    </el-scrollbar>

    <div v-if="!isCollapse && subMenu && subMenu.length > 1" class="left-sub-menu">
      <el-scrollbar wrap-class="scrollbar-wrapper">
        <el-menu
          :default-active="subMenuActives"
          class="el-menu-vertical-demo"
          router
        >
          <el-menu-item v-for="(item, index) in subMenu" :key="index" :index="resolvePath(item.path)">
            <span slot="title">{{ item.meta.title }}</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";
  .isOpenCollapseMenu {
    .main-menu{
      width: $sideBarWidth;
    }
  }
  .left-sub-menu{
    position: fixed;
    width: $sideBarSubMenuWidth;
    top: 52px;
    left: $sideBarWidth;
    height: calc(100% - 52px);
    overflow: hidden;
  }
</style>

<script>
import path from 'path'
import { mapGetters } from 'vuex'
import Logo from './Logo'
import SidebarItem from './SidebarItem'
import variables from '@/styles/variables.scss'
import { isExternal } from '@/utils/validate'

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      subMenuActive: '',
      tempMenu: []
    }
  },
  computed: {
    ...mapGetters([
      'permission_routes',
      'sidebar'
    ]),
    subMenuActives() {
      if (this.$SubMenu.state.menu && this.$SubMenu.state.menu.resetSubMenuActive) {
        return this.resolvePath(this.$SubMenu.state.menu.children[0].path)
      }
      return this.subMenuActive
    },
    subMenu() {
      return this.$SubMenu.state.menu ? this.$SubMenu.state.menu.children : []
    },
    activeMenu() {
      const menu = this.$SubMenu.state.menu
      if (menu && menu.path) {
        return menu.path
      }
      const route = this.$route
      const { meta, path } = route
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }
      return path
    },
    showLogo() {
      return this.$store.state.settings.sidebarLogo
    },
    variables() {
      return variables
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      const basePath = this.$SubMenu.state.menu ? this.$SubMenu.state.menu.path : ''
      if (isExternal(basePath)) {
        return basePath
      }
      return path.resolve(basePath, routePath)
    }
  },
  mounted() {
    this.permission_routes.forEach((route) => {
      if (!route.children || route.children.length < 2) {
        return route
      }
      route.children.forEach((item, index) => {
        if (this.$route.name === item.name) {
          this.$SubMenu.commit('update', route)
          this.subMenuActive = this.resolvePath(item.path)
        }
      })
    })
  }
}
</script>
