import Vuex from 'vuex'

const menu = new Vuex.Store({
  state: {
    menu: []
  },
  mutations: {
    update(state, value) {
      state.menu = value
    }
  }
})

export default menu
