<template>
  <div
    class="palace-cell-v"
    :class="{ 'is-selected': isSelected, 'is-sanfang': !isSelected && isSanfang }"
    :style="cellStyle"
    @click="$emit('click', palace.index)"
  >
    <!-- Main Content Area: Stars & Si Hua -->
    <div class="pc-content">
       <!-- Stars with Si Hua (Major + Minor) -->
       <div class="stars-with-sihua" :style="{ gridTemplateColumns: allStars.length ? `repeat(${allStars.length}, auto)` : 'none' }">
          <template v-for="(s, colIndex) in allStars" :key="s.name">
             <!-- Star Info -->
             <div class="star-col-v" :style="{ gridColumn: colIndex + 1, gridRow: 1 }">
               <div class="sc-info">
                  <span class="sname-v" :class="[palace.majorStars.includes(s) ? 'major-name' : (isLucky(s.name) ? 'lucky-star' : 'minor-name'), flyingSihuaBg[s.name] ? 'flying-highlight' : '']"
                        :style="flyingSihuaBg[s.name] ? { backgroundColor: flyingSihuaBg[s.name] } : {}"
                        @click.stop="$emit('click-star', s.name)"
                  >{{ s.name }}</span>
                  <span class="sbright-v" :class="bClass(s.brightness)">{{ s.brightness }}</span>
               </div>
             </div>
             <!-- Si Hua Slots -->
             <div v-for="(level, rowOffset) in activeSihuaLevels" :key="s.name+'-sh-'+level" class="sh-slot" :style="{ gridColumn: colIndex + 1, gridRow: 2 + rowOffset }">
                 <span v-if="getStarMutagens(s.name, s.mutagen)[level-1]" 
                       class="sh-chip" 
                       :style="{ backgroundColor: getStarMutagens(s.name, s.mutagen)[level-1].color }"
                 >{{ getStarMutagens(s.name, s.mutagen)[level-1].label }}</span>
             </div>
          </template>
       </div>

       <!-- Adjective (Misc) Stars - horizontal wrapping -->
       <div v-if="showAdjStars" class="adj-stars-wrap">
          <span v-for="s in palace.adjectiveStars" :key="s.name" class="adj-star-item">{{ s.name }}</span>
       </div>
    </div>

    <!-- Bottom: Flow Stars + Body Tag -->
    <div class="pc-footer">
       <div v-if="flowStars" class="flow-stars-h">
        <span v-for="(s, si) in flowStars" :key="si"
           class="flow-star" :style="{ color: s.color }">
           {{ s.name }}
        </span>
       </div>
       <span v-if="palace.isBodyPalace" class="body-tag-footer">身</span>
    </div>

    <!-- Derived name -->
    <div v-if="derivedName" class="derived-label-abs">{{ derivedName }}</div>

    <!-- Palace Bottom Info -->
    <div class="palace-bottom-bar">
       <div class="pbb-left">
          <span class="decadal-range" v-if="palace.decadal">{{ palace.decadal.range[0] }} - {{ palace.decadal.range[1] }}</span>
          <span class="cs12">{{ palace.changsheng12 }}</span>
       </div>
       <div class="pbb-right">
          <!-- Right to left: 流月, 流年, 大限, 本命, 身, 干支 -->
          <span v-if="monthlyPalaceName" 
                class="pbb-vtext scope-pname" :style="{ color: scopeColors.yue }"
          >{{ monthlyPalaceName }}</span>
          <span v-if="yearlyPalaceName" 
                class="pbb-vtext scope-pname" :style="{ color: scopeColors.yi }"
          >{{ yearlyPalaceName }}</span>
          <span v-if="decadalPalaceName" 
                class="pbb-vtext scope-pname" :style="{ color: scopeColors.da }"
          >{{ decadalPalaceName }}</span>
          <!-- Birth palace name -->
          <span class="pbb-vtext p-name">{{ palace.name }}</span>
          <!-- Stem + Branch (rightmost) -->
          <span class="pbb-vtext p-branch">{{ palace.heavenlyStem }}{{ palace.earthlyBranch }}</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SCOPE_COLORS, bClass, gridStyle } from '../composables/usePaipanConstants'

const props = defineProps({
  palace: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  isSanfang: { type: Boolean, default: false },
  flyingSihuaBg: { type: Object, default: () => ({}) },
  flowStars: { type: Array, default: null },
  derivedName: { type: String, default: '' },
  getStarMutagens: { type: Function, required: true },
  // Scope palace names
  decadalPalaceName: { type: String, default: '' },
  yearlyPalaceName: { type: String, default: '' },
  monthlyPalaceName: { type: String, default: '' },
  showAdjStars: { type: Boolean, default: true },
})

defineEmits(['click', 'click-star'])

const scopeColors = SCOPE_COLORS

const cellStyle = computed(() => gridStyle(props.palace))

const allStars = computed(() => [...props.palace.majorStars, ...props.palace.minorStars])

const activeSihuaLevels = computed(() => {
  if (!allStars.value || allStars.value.length === 0) return []
  const levels = []
  for (let level = 1; level <= 4; level++) {
     let hasSihua = false
     for (const s of allStars.value) {
        const mut = props.getStarMutagens(s.name, s.mutagen)
        if (mut && mut[level - 1]) {
           hasSihua = true
           break
        }
     }
     if (hasSihua) levels.push(level)
  }
  return levels
})

const LUCKY_STARS = new Set(['左辅','右弼','文昌','文曲','天魁','天钺','禄存','天马'])
function isLucky(name) { return LUCKY_STARS.has(name) }
</script>

<style scoped>
/* === Palace Cell Vertical === */
.palace-cell-v {
  border: 1px solid #d4c5a9;
  min-height: 140px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  padding: 4px 2px 2px 2px;
}
.palace-cell-v:hover { 
  background: rgba(184, 134, 11, 0.06); 
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 37, 0, 0.15);
  z-index: 5;
}
.palace-cell-v:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(139, 37, 0, 0.1);
}
.palace-cell-v.is-selected { outline: 2px solid #009900; outline-offset: -2px; background: rgba(0, 153, 0, 0.05); z-index: 10; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 153, 0, 0.2); }
.palace-cell-v.is-sanfang { outline: 2px dashed #b8860b; outline-offset: -2px; background: rgba(184, 134, 11, 0.05); }

/* Content Area */
.pc-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 2px;
  gap: 2px;
  overflow: visible;
}

.stars-with-sihua {
  display: grid;
  gap: 1px;
  justify-content: start;
  justify-items: center;
}

.star-col-v {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 14px;
  flex-shrink: 0;
}
.sc-info {
    writing-mode: vertical-rl;
    text-orientation: upright;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
}

.sname-v { font-weight: bold; color: #3c2415; font-size: 13px; line-height: 1.1; white-space: nowrap; }
.sname-v.flying-highlight {
  color: #fff;
  padding: 2px;
  border-radius: 3px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  padding-right: 4px;
}
.major-name { font-size: 14px; color: #8b2500; }
.minor-name { font-size: 11px; color: #555; }
.lucky-star { font-size: 12px; color: #4a90d9; }

.sbright-v { font-size: 9px; margin-top: 2px; }

/* Si Hua Rows */
.sh-slot {
    width: 14px;
    min-width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.sh-chip {
    width: 14px;
    height: 14px;
    color: #fff;
    font-size: 9px;
    border-radius: 3px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    text-shadow: 0 1px 1px rgba(0,0,0,0.2);
}

/* Adjective Stars */
.adj-stars-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 1px 3px;
  padding-top: 2px;
}
.adj-star-item {
  font-size: 10px;
  color: #888;
  white-space: nowrap;
  line-height: 1.2;
}

/* Flow Stars */
.pc-footer {
  margin-top: auto;
  min-height: 16px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 2px;
}
.flow-stars-h { flex: 1; }
.body-tag-footer {
  background: #c41e3a; color: #fff; font-size: 9px;
  padding: 0 2px; border-radius: 2px;
  flex-shrink: 0; margin-left: auto;
}
.flow-stars-h {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 10px;
}
.flow-star { color: #555; }

/* Palace Bottom Bar */
.palace-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px dotted #e0d5c0;
  padding-top: 2px;
  margin-top: 2px;
  flex-direction: column;
}
.pbb-left { display: flex; flex-direction: row; width: 100%;}
.pbb-right {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 1px;
}
.pbb-vtext {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 1px;
  line-height: 1.1;
}
.scope-pname {
  font-size: 10px;
  font-weight: bold;
}
.cs12 { color: #888; font-size: 10px; }
.decadal-range { color: #c41e3a; font-weight: bold; font-size: 10px; flex: 1; text-align: right; padding-right: 3px;}
.p-name { color: #8b2500; font-weight: bold; font-size: 12px; }
.body-tag { background: #c41e3a; color: #fff; font-size: 9px; padding: 0 2px; border-radius: 2px; display: inline-block; }
.p-branch { color: #b8860b; font-size: 11px; font-weight: bold; }

.derived-label-abs {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 9px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-weight: bold;
  color: #cc6600;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 1px;
  border-bottom-left-radius: 4px;
  line-height: 1.1;
  letter-spacing: 1px;
}
</style>
