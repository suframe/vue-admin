<template>
  <div v-if="!item.hidden">
    <template v-if="hasOneShowingChild(item.children,item) && (!onlyOneChild.children||onlyOneChild.noShowingChildren)&&!item.alwaysShow">
      <app-link v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}" @click="setSubMenu([])">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
          <div class="menu_item_radius menu_item_top_radius"></div>
          <div class="menu_item_radius menu_item_bottom_radius"></div>
        </el-menu-item>
      </app-link>
    </template>
    <template v-else-if="isCollapse">
      <el-submenu ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
        <template slot="title">
          <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
        </template>
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :is-nest="true"
          :item="child"
          :base-path="resolvePath(child.path)"
          class="nest-menu"
        />
      </el-submenu>
    </template>
    <template v-else>
      <app-link :to="resolvePath(item.children[0].path)">
        <el-menu-item ref="subMenu" :index="resolvePath(item.path)" :class="{'submenu-title-noDropdown':!isNest}" @click="setSubMenu(item)">
          <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
          <div class="menu_item_radius menu_item_top_radius"></div>
          <div class="menu_item_radius menu_item_bottom_radius"></div>
        </el-menu-item>
      </app-link>
    </template>
  </div>
</template>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";
  .isOpenCollapseMenu{
    .scrollbar-wrapper{
      .el-menu > div > a{
        padding-left: 5px;
        /*background: #fff;*/
        /*margin-left: 10px;*/
        /*border-top-left-radius: 15px;*/
        /*border-bottom-left-radius: 15px;*/
      }
      .el-menu .el-menu-item{
        .menu_item_radius {
          display: none;
          width: 10px;
          height: 10px;
          background: #fff;
          position: absolute;
          z-index: 1;
        }
        &:hover{
          z-index: 10;
        }
        border-top-left-radius: 40px;
        border-bottom-left-radius: 40px;
        padding: 0 0 0 15px !important;
        &.is-active {
          &:hover{
            z-index: 10;
            .menu_item_radius{
              background: $menuHover;
            }
          }
          background-color: #fff !important;
          color: $menuBg !important;
          span {
            color: $menuBg !important;
          }

          .menu_item_radius {
            display: inline-block;
          }
          .menu_item_bottom_radius {
            bottom: -10px;
            right: 0;
          }
          .menu_item_top_radius {
            top: -10px;
            right: 0;
          }
          .menu_item_top_radius:before {
            content: "";
            display: inline-block;
            width: 10px;
            height: 10px;
            background: $menuBg;
            position: absolute;
            left: 0;
            top: 0;
            border-radius: 0 0 5px 0;
          }
          .menu_item_bottom_radius:after {
            content: "";
            display: inline-block;
            width: 10px;
            height: 10px;
            background: $menuBg;
            position: absolute;
            left: 0;
            bottom: 0;
            border-radius: 0 5px 0 0;
          }
        }
        &.is-active:hover {
          color: #fff !important;
        }
      }
    }
  }
</style>

<script>
import path from 'path'
import { isExternal } from '@/utils/validate'
import Item from './Item'
import AppLink from './Link'
import FixiOSBug from './FixiOSBug'
import { mapGetters } from 'vuex'

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    }
  },
  data() {
    // To fix https://github.com/PanJiaChen/vue-admin-template/issues/237
    // TODO: refactor with render function
    this.onlyOneChild = null
    return {}
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    isCollapse() {
      return !this.sidebar.opened
    }
  },
  methods: {
    hasOneShowingChild(children = [], parent) {
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        } else {
          // Temp set(will be used if only has one showing child)
          this.onlyOneChild = item
          return true
        }
      })

      // When there is only one child router, the child router is displayed by default
      if (showingChildren.length === 1) {
        return true
      }

      // Show parent if there are no child router to display
      if (showingChildren.length === 0) {
        this.onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    },
    setSubMenu(item) {
      this.$SubMenu.commit('update', {
        ...item, ...{ resetSubMenuActive: true }
      })
    },
    resolvePath(routePath) {
      if (isExternal(routePath)) {
        return routePath
      }
      if (isExternal(this.basePath)) {
        return this.basePath
      }
      return path.resolve(this.basePath, routePath)
    }
  }
}
</script>
