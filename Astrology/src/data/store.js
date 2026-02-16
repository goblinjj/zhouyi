import { reactive } from 'vue'

export const store = reactive({
  count: 0,
  inc() {
    this.count++;
  }
})