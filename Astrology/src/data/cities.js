/**
 * Global cities dataset for true solar time calculation.
 * Each city: { name, nameEn, country, province, lng, lat, tz }
 *   name     - Chinese name
 *   nameEn   - English name
 *   country  - Country (Chinese)
 *   province - Province / state (may be empty)
 *   lng      - Longitude (East +, West -)
 *   lat      - Latitude (North +, South -)
 *   tz       - Standard UTC offset in hours
 */

export const CITIES = [
  // ============================================================
  // CHINA - Direct-administered municipalities
  // ============================================================
  { name: '北京', nameEn: 'Beijing', country: '中国', province: '北京', lng: 116.41, lat: 39.90, tz: 8 },
  { name: '上海', nameEn: 'Shanghai', country: '中国', province: '上海', lng: 121.47, lat: 31.23, tz: 8 },
  { name: '天津', nameEn: 'Tianjin', country: '中国', province: '天津', lng: 117.19, lat: 39.13, tz: 8 },
  { name: '重庆', nameEn: 'Chongqing', country: '中国', province: '重庆', lng: 106.55, lat: 29.56, tz: 8 },

  // ============================================================
  // CHINA - Provincial capitals
  // ============================================================
  { name: '石家庄', nameEn: 'Shijiazhuang', country: '中国', province: '河北', lng: 114.51, lat: 38.04, tz: 8 },
  { name: '太原', nameEn: 'Taiyuan', country: '中国', province: '山西', lng: 112.55, lat: 37.87, tz: 8 },
  { name: '呼和浩特', nameEn: 'Hohhot', country: '中国', province: '内蒙古', lng: 111.75, lat: 40.84, tz: 8 },
  { name: '沈阳', nameEn: 'Shenyang', country: '中国', province: '辽宁', lng: 123.43, lat: 41.80, tz: 8 },
  { name: '长春', nameEn: 'Changchun', country: '中国', province: '吉林', lng: 125.32, lat: 43.88, tz: 8 },
  { name: '哈尔滨', nameEn: 'Harbin', country: '中国', province: '黑龙江', lng: 126.63, lat: 45.75, tz: 8 },
  { name: '南京', nameEn: 'Nanjing', country: '中国', province: '江苏', lng: 118.80, lat: 32.06, tz: 8 },
  { name: '杭州', nameEn: 'Hangzhou', country: '中国', province: '浙江', lng: 120.15, lat: 30.27, tz: 8 },
  { name: '合肥', nameEn: 'Hefei', country: '中国', province: '安徽', lng: 117.28, lat: 31.86, tz: 8 },
  { name: '福州', nameEn: 'Fuzhou', country: '中国', province: '福建', lng: 119.30, lat: 26.08, tz: 8 },
  { name: '南昌', nameEn: 'Nanchang', country: '中国', province: '江西', lng: 115.86, lat: 28.68, tz: 8 },
  { name: '济南', nameEn: 'Jinan', country: '中国', province: '山东', lng: 117.00, lat: 36.67, tz: 8 },
  { name: '郑州', nameEn: 'Zhengzhou', country: '中国', province: '河南', lng: 113.65, lat: 34.76, tz: 8 },
  { name: '武汉', nameEn: 'Wuhan', country: '中国', province: '湖北', lng: 114.30, lat: 30.59, tz: 8 },
  { name: '长沙', nameEn: 'Changsha', country: '中国', province: '湖南', lng: 112.97, lat: 28.23, tz: 8 },
  { name: '广州', nameEn: 'Guangzhou', country: '中国', province: '广东', lng: 113.26, lat: 23.13, tz: 8 },
  { name: '南宁', nameEn: 'Nanning', country: '中国', province: '广西', lng: 108.37, lat: 22.82, tz: 8 },
  { name: '海口', nameEn: 'Haikou', country: '中国', province: '海南', lng: 110.35, lat: 20.02, tz: 8 },
  { name: '成都', nameEn: 'Chengdu', country: '中国', province: '四川', lng: 104.07, lat: 30.67, tz: 8 },
  { name: '贵阳', nameEn: 'Guiyang', country: '中国', province: '贵州', lng: 106.71, lat: 26.65, tz: 8 },
  { name: '昆明', nameEn: 'Kunming', country: '中国', province: '云南', lng: 102.73, lat: 25.04, tz: 8 },
  { name: '拉萨', nameEn: 'Lhasa', country: '中国', province: '西藏', lng: 91.11, lat: 29.65, tz: 8 },
  { name: '西安', nameEn: "Xi'an", country: '中国', province: '陕西', lng: 108.94, lat: 34.26, tz: 8 },
  { name: '兰州', nameEn: 'Lanzhou', country: '中国', province: '甘肃', lng: 103.83, lat: 36.06, tz: 8 },
  { name: '西宁', nameEn: 'Xining', country: '中国', province: '青海', lng: 101.78, lat: 36.62, tz: 8 },
  { name: '银川', nameEn: 'Yinchuan', country: '中国', province: '宁夏', lng: 106.23, lat: 38.49, tz: 8 },
  { name: '乌鲁木齐', nameEn: 'Urumqi', country: '中国', province: '新疆', lng: 87.62, lat: 43.83, tz: 8 },
  { name: '香港', nameEn: 'Hong Kong', country: '中国', province: '香港', lng: 114.17, lat: 22.28, tz: 8 },
  { name: '澳门', nameEn: 'Macau', country: '中国', province: '澳门', lng: 113.54, lat: 22.20, tz: 8 },
  { name: '台北', nameEn: 'Taipei', country: '中国', province: '台湾', lng: 121.56, lat: 25.03, tz: 8 },

  // ============================================================
  // CHINA - Hebei
  // ============================================================
  { name: '唐山', nameEn: 'Tangshan', country: '中国', province: '河北', lng: 118.18, lat: 39.63, tz: 8 },
  { name: '保定', nameEn: 'Baoding', country: '中国', province: '河北', lng: 115.46, lat: 38.87, tz: 8 },
  { name: '邯郸', nameEn: 'Handan', country: '中国', province: '河北', lng: 114.49, lat: 36.61, tz: 8 },
  { name: '秦皇岛', nameEn: 'Qinhuangdao', country: '中国', province: '河北', lng: 119.60, lat: 39.94, tz: 8 },
  { name: '邢台', nameEn: 'Xingtai', country: '中国', province: '河北', lng: 114.50, lat: 37.07, tz: 8 },
  { name: '张家口', nameEn: 'Zhangjiakou', country: '中国', province: '河北', lng: 114.88, lat: 40.82, tz: 8 },
  { name: '承德', nameEn: 'Chengde', country: '中国', province: '河北', lng: 117.93, lat: 40.97, tz: 8 },
  { name: '沧州', nameEn: 'Cangzhou', country: '中国', province: '河北', lng: 116.84, lat: 38.31, tz: 8 },
  { name: '廊坊', nameEn: 'Langfang', country: '中国', province: '河北', lng: 116.70, lat: 39.52, tz: 8 },
  { name: '衡水', nameEn: 'Hengshui', country: '中国', province: '河北', lng: 115.67, lat: 37.74, tz: 8 },

  // ============================================================
  // CHINA - Shanxi
  // ============================================================
  { name: '大同', nameEn: 'Datong', country: '中国', province: '山西', lng: 113.30, lat: 40.08, tz: 8 },
  { name: '阳泉', nameEn: 'Yangquan', country: '中国', province: '山西', lng: 113.58, lat: 37.87, tz: 8 },
  { name: '长治', nameEn: 'Changzhi', country: '中国', province: '山西', lng: 113.12, lat: 36.20, tz: 8 },
  { name: '晋城', nameEn: 'Jincheng', country: '中国', province: '山西', lng: 112.85, lat: 35.49, tz: 8 },
  { name: '朔州', nameEn: 'Shuozhou', country: '中国', province: '山西', lng: 112.43, lat: 39.33, tz: 8 },
  { name: '运城', nameEn: 'Yuncheng', country: '中国', province: '山西', lng: 111.01, lat: 35.03, tz: 8 },
  { name: '临汾', nameEn: 'Linfen', country: '中国', province: '山西', lng: 111.52, lat: 36.08, tz: 8 },
  { name: '吕梁', nameEn: 'Lvliang', country: '中国', province: '山西', lng: 111.14, lat: 37.52, tz: 8 },
  { name: '忻州', nameEn: 'Xinzhou', country: '中国', province: '山西', lng: 112.73, lat: 38.42, tz: 8 },
  { name: '晋中', nameEn: 'Jinzhong', country: '中国', province: '山西', lng: 112.75, lat: 37.69, tz: 8 },

  // ============================================================
  // CHINA - Inner Mongolia
  // ============================================================
  { name: '包头', nameEn: 'Baotou', country: '中国', province: '内蒙古', lng: 109.84, lat: 40.66, tz: 8 },
  { name: '赤峰', nameEn: 'Chifeng', country: '中国', province: '内蒙古', lng: 118.89, lat: 42.26, tz: 8 },
  { name: '鄂尔多斯', nameEn: 'Ordos', country: '中国', province: '内蒙古', lng: 109.99, lat: 39.82, tz: 8 },
  { name: '通辽', nameEn: 'Tongliao', country: '中国', province: '内蒙古', lng: 122.26, lat: 43.65, tz: 8 },
  { name: '呼伦贝尔', nameEn: 'Hulunbuir', country: '中国', province: '内蒙古', lng: 119.77, lat: 49.21, tz: 8 },
  { name: '乌海', nameEn: 'Wuhai', country: '中国', province: '内蒙古', lng: 106.81, lat: 39.66, tz: 8 },
  { name: '巴彦淖尔', nameEn: 'Bayannur', country: '中国', province: '内蒙古', lng: 107.39, lat: 40.74, tz: 8 },

  // ============================================================
  // CHINA - Liaoning
  // ============================================================
  { name: '大连', nameEn: 'Dalian', country: '中国', province: '辽宁', lng: 121.61, lat: 38.91, tz: 8 },
  { name: '鞍山', nameEn: 'Anshan', country: '中国', province: '辽宁', lng: 122.99, lat: 41.11, tz: 8 },
  { name: '抚顺', nameEn: 'Fushun', country: '中国', province: '辽宁', lng: 123.97, lat: 41.86, tz: 8 },
  { name: '本溪', nameEn: 'Benxi', country: '中国', province: '辽宁', lng: 123.77, lat: 41.29, tz: 8 },
  { name: '丹东', nameEn: 'Dandong', country: '中国', province: '辽宁', lng: 124.38, lat: 40.13, tz: 8 },
  { name: '锦州', nameEn: 'Jinzhou', country: '中国', province: '辽宁', lng: 121.13, lat: 41.10, tz: 8 },
  { name: '营口', nameEn: 'Yingkou', country: '中国', province: '辽宁', lng: 122.24, lat: 40.67, tz: 8 },
  { name: '阜新', nameEn: 'Fuxin', country: '中国', province: '辽宁', lng: 121.67, lat: 42.02, tz: 8 },
  { name: '辽阳', nameEn: 'Liaoyang', country: '中国', province: '辽宁', lng: 123.17, lat: 41.27, tz: 8 },
  { name: '盘锦', nameEn: 'Panjin', country: '中国', province: '辽宁', lng: 122.07, lat: 41.12, tz: 8 },
  { name: '铁岭', nameEn: 'Tieling', country: '中国', province: '辽宁', lng: 123.84, lat: 42.29, tz: 8 },
  { name: '朝阳', nameEn: 'Chaoyang', country: '中国', province: '辽宁', lng: 120.45, lat: 41.57, tz: 8 },
  { name: '葫芦岛', nameEn: 'Huludao', country: '中国', province: '辽宁', lng: 120.86, lat: 40.76, tz: 8 },

  // ============================================================
  // CHINA - Jilin
  // ============================================================
  { name: '吉林', nameEn: 'Jilin', country: '中国', province: '吉林', lng: 126.55, lat: 43.84, tz: 8 },
  { name: '四平', nameEn: 'Siping', country: '中国', province: '吉林', lng: 124.37, lat: 43.17, tz: 8 },
  { name: '通化', nameEn: 'Tonghua', country: '中国', province: '吉林', lng: 125.94, lat: 41.73, tz: 8 },
  { name: '白城', nameEn: 'Baicheng', country: '中国', province: '吉林', lng: 122.84, lat: 45.62, tz: 8 },
  { name: '辽源', nameEn: 'Liaoyuan', country: '中国', province: '吉林', lng: 125.15, lat: 42.90, tz: 8 },
  { name: '松原', nameEn: 'Songyuan', country: '中国', province: '吉林', lng: 124.83, lat: 45.18, tz: 8 },
  { name: '白山', nameEn: 'Baishan', country: '中国', province: '吉林', lng: 126.43, lat: 41.94, tz: 8 },
  { name: '延吉', nameEn: 'Yanji', country: '中国', province: '吉林', lng: 129.51, lat: 42.89, tz: 8 },

  // ============================================================
  // CHINA - Heilongjiang
  // ============================================================
  { name: '齐齐哈尔', nameEn: 'Qiqihar', country: '中国', province: '黑龙江', lng: 123.97, lat: 47.35, tz: 8 },
  { name: '大庆', nameEn: 'Daqing', country: '中国', province: '黑龙江', lng: 125.10, lat: 46.59, tz: 8 },
  { name: '牡丹江', nameEn: 'Mudanjiang', country: '中国', province: '黑龙江', lng: 129.59, lat: 44.58, tz: 8 },
  { name: '佳木斯', nameEn: 'Jiamusi', country: '中国', province: '黑龙江', lng: 130.36, lat: 46.80, tz: 8 },
  { name: '鸡西', nameEn: 'Jixi', country: '中国', province: '黑龙江', lng: 130.97, lat: 45.30, tz: 8 },
  { name: '双鸭山', nameEn: 'Shuangyashan', country: '中国', province: '黑龙江', lng: 131.16, lat: 46.65, tz: 8 },
  { name: '鹤岗', nameEn: 'Hegang', country: '中国', province: '黑龙江', lng: 130.28, lat: 47.33, tz: 8 },
  { name: '绥化', nameEn: 'Suihua', country: '中国', province: '黑龙江', lng: 126.97, lat: 46.64, tz: 8 },
  { name: '黑河', nameEn: 'Heihe', country: '中国', province: '黑龙江', lng: 127.53, lat: 50.24, tz: 8 },
  { name: '伊春', nameEn: 'Yichun', country: '中国', province: '黑龙江', lng: 128.90, lat: 47.73, tz: 8 },

  // ============================================================
  // CHINA - Jiangsu
  // ============================================================
  { name: '苏州', nameEn: 'Suzhou', country: '中国', province: '江苏', lng: 120.62, lat: 31.30, tz: 8 },
  { name: '无锡', nameEn: 'Wuxi', country: '中国', province: '江苏', lng: 120.31, lat: 31.49, tz: 8 },
  { name: '常州', nameEn: 'Changzhou', country: '中国', province: '江苏', lng: 119.97, lat: 31.77, tz: 8 },
  { name: '徐州', nameEn: 'Xuzhou', country: '中国', province: '江苏', lng: 117.18, lat: 34.26, tz: 8 },
  { name: '南通', nameEn: 'Nantong', country: '中国', province: '江苏', lng: 120.86, lat: 32.01, tz: 8 },
  { name: '连云港', nameEn: 'Lianyungang', country: '中国', province: '江苏', lng: 119.18, lat: 34.60, tz: 8 },
  { name: '淮安', nameEn: 'Huaian', country: '中国', province: '江苏', lng: 119.02, lat: 33.61, tz: 8 },
  { name: '盐城', nameEn: 'Yancheng', country: '中国', province: '江苏', lng: 120.16, lat: 33.35, tz: 8 },
  { name: '扬州', nameEn: 'Yangzhou', country: '中国', province: '江苏', lng: 119.41, lat: 32.39, tz: 8 },
  { name: '镇江', nameEn: 'Zhenjiang', country: '中国', province: '江苏', lng: 119.45, lat: 32.20, tz: 8 },
  { name: '泰州', nameEn: 'Taizhou', country: '中国', province: '江苏', lng: 119.92, lat: 32.46, tz: 8 },
  { name: '宿迁', nameEn: 'Suqian', country: '中国', province: '江苏', lng: 118.28, lat: 33.96, tz: 8 },

  // ============================================================
  // CHINA - Zhejiang
  // ============================================================
  { name: '宁波', nameEn: 'Ningbo', country: '中国', province: '浙江', lng: 121.55, lat: 29.87, tz: 8 },
  { name: '温州', nameEn: 'Wenzhou', country: '中国', province: '浙江', lng: 120.70, lat: 28.00, tz: 8 },
  { name: '嘉兴', nameEn: 'Jiaxing', country: '中国', province: '浙江', lng: 120.76, lat: 30.77, tz: 8 },
  { name: '湖州', nameEn: 'Huzhou', country: '中国', province: '浙江', lng: 120.09, lat: 30.87, tz: 8 },
  { name: '绍兴', nameEn: 'Shaoxing', country: '中国', province: '浙江', lng: 120.58, lat: 30.00, tz: 8 },
  { name: '金华', nameEn: 'Jinhua', country: '中国', province: '浙江', lng: 119.65, lat: 29.08, tz: 8 },
  { name: '衢州', nameEn: 'Quzhou', country: '中国', province: '浙江', lng: 118.87, lat: 28.94, tz: 8 },
  { name: '台州', nameEn: 'Taizhou', country: '中国', province: '浙江', lng: 121.42, lat: 28.66, tz: 8 },
  { name: '丽水', nameEn: 'Lishui', country: '中国', province: '浙江', lng: 119.92, lat: 28.47, tz: 8 },
  { name: '舟山', nameEn: 'Zhoushan', country: '中国', province: '浙江', lng: 122.11, lat: 29.99, tz: 8 },

  // ============================================================
  // CHINA - Anhui
  // ============================================================
  { name: '芜湖', nameEn: 'Wuhu', country: '中国', province: '安徽', lng: 118.38, lat: 31.33, tz: 8 },
  { name: '蚌埠', nameEn: 'Bengbu', country: '中国', province: '安徽', lng: 117.39, lat: 32.92, tz: 8 },
  { name: '淮南', nameEn: 'Huainan', country: '中国', province: '安徽', lng: 117.00, lat: 32.63, tz: 8 },
  { name: '马鞍山', nameEn: 'Maanshan', country: '中国', province: '安徽', lng: 118.51, lat: 31.67, tz: 8 },
  { name: '淮北', nameEn: 'Huaibei', country: '中国', province: '安徽', lng: 116.79, lat: 33.97, tz: 8 },
  { name: '安庆', nameEn: 'Anqing', country: '中国', province: '安徽', lng: 117.05, lat: 30.53, tz: 8 },
  { name: '黄山', nameEn: 'Huangshan', country: '中国', province: '安徽', lng: 118.34, lat: 29.71, tz: 8 },
  { name: '阜阳', nameEn: 'Fuyang', country: '中国', province: '安徽', lng: 115.81, lat: 32.89, tz: 8 },
  { name: '宿州', nameEn: 'Suzhou', country: '中国', province: '安徽', lng: 116.98, lat: 33.64, tz: 8 },
  { name: '滁州', nameEn: 'Chuzhou', country: '中国', province: '安徽', lng: 118.31, lat: 32.30, tz: 8 },
  { name: '六安', nameEn: 'Luan', country: '中国', province: '安徽', lng: 116.52, lat: 31.74, tz: 8 },
  { name: '亳州', nameEn: 'Bozhou', country: '中国', province: '安徽', lng: 115.78, lat: 33.85, tz: 8 },

  // ============================================================
  // CHINA - Fujian
  // ============================================================
  { name: '厦门', nameEn: 'Xiamen', country: '中国', province: '福建', lng: 118.09, lat: 24.48, tz: 8 },
  { name: '泉州', nameEn: 'Quanzhou', country: '中国', province: '福建', lng: 118.59, lat: 24.91, tz: 8 },
  { name: '漳州', nameEn: 'Zhangzhou', country: '中国', province: '福建', lng: 117.65, lat: 24.51, tz: 8 },
  { name: '莆田', nameEn: 'Putian', country: '中国', province: '福建', lng: 119.01, lat: 25.43, tz: 8 },
  { name: '三明', nameEn: 'Sanming', country: '中国', province: '福建', lng: 117.64, lat: 26.26, tz: 8 },
  { name: '龙岩', nameEn: 'Longyan', country: '中国', province: '福建', lng: 117.02, lat: 25.10, tz: 8 },
  { name: '南平', nameEn: 'Nanping', country: '中国', province: '福建', lng: 118.18, lat: 26.64, tz: 8 },
  { name: '宁德', nameEn: 'Ningde', country: '中国', province: '福建', lng: 119.53, lat: 26.66, tz: 8 },

  // ============================================================
  // CHINA - Jiangxi
  // ============================================================
  { name: '景德镇', nameEn: 'Jingdezhen', country: '中国', province: '江西', lng: 117.21, lat: 29.29, tz: 8 },
  { name: '萍乡', nameEn: 'Pingxiang', country: '中国', province: '江西', lng: 113.85, lat: 27.62, tz: 8 },
  { name: '九江', nameEn: 'Jiujiang', country: '中国', province: '江西', lng: 116.00, lat: 29.70, tz: 8 },
  { name: '赣州', nameEn: 'Ganzhou', country: '中国', province: '江西', lng: 114.93, lat: 25.83, tz: 8 },
  { name: '吉安', nameEn: 'Jian', country: '中国', province: '江西', lng: 114.99, lat: 27.11, tz: 8 },
  { name: '宜春', nameEn: 'Yichun', country: '中国', province: '江西', lng: 114.42, lat: 27.80, tz: 8 },
  { name: '抚州', nameEn: 'Fuzhou', country: '中国', province: '江西', lng: 116.36, lat: 27.95, tz: 8 },
  { name: '上饶', nameEn: 'Shangrao', country: '中国', province: '江西', lng: 117.97, lat: 28.45, tz: 8 },

  // ============================================================
  // CHINA - Shandong
  // ============================================================
  { name: '青岛', nameEn: 'Qingdao', country: '中国', province: '山东', lng: 120.38, lat: 36.07, tz: 8 },
  { name: '淄博', nameEn: 'Zibo', country: '中国', province: '山东', lng: 118.05, lat: 36.81, tz: 8 },
  { name: '烟台', nameEn: 'Yantai', country: '中国', province: '山东', lng: 121.45, lat: 37.46, tz: 8 },
  { name: '潍坊', nameEn: 'Weifang', country: '中国', province: '山东', lng: 119.16, lat: 36.71, tz: 8 },
  { name: '济宁', nameEn: 'Jining', country: '中国', province: '山东', lng: 116.59, lat: 35.41, tz: 8 },
  { name: '泰安', nameEn: 'Taian', country: '中国', province: '山东', lng: 117.09, lat: 36.19, tz: 8 },
  { name: '威海', nameEn: 'Weihai', country: '中国', province: '山东', lng: 122.12, lat: 37.51, tz: 8 },
  { name: '日照', nameEn: 'Rizhao', country: '中国', province: '山东', lng: 119.53, lat: 35.42, tz: 8 },
  { name: '临沂', nameEn: 'Linyi', country: '中国', province: '山东', lng: 118.36, lat: 35.10, tz: 8 },
  { name: '德州', nameEn: 'Dezhou', country: '中国', province: '山东', lng: 116.36, lat: 37.44, tz: 8 },
  { name: '聊城', nameEn: 'Liaocheng', country: '中国', province: '山东', lng: 115.99, lat: 36.46, tz: 8 },
  { name: '滨州', nameEn: 'Binzhou', country: '中国', province: '山东', lng: 117.97, lat: 37.38, tz: 8 },
  { name: '菏泽', nameEn: 'Heze', country: '中国', province: '山东', lng: 115.48, lat: 35.23, tz: 8 },
  { name: '枣庄', nameEn: 'Zaozhuang', country: '中国', province: '山东', lng: 117.32, lat: 34.81, tz: 8 },
  { name: '东营', nameEn: 'Dongying', country: '中国', province: '山东', lng: 118.67, lat: 37.43, tz: 8 },

  // ============================================================
  // CHINA - Henan
  // ============================================================
  { name: '洛阳', nameEn: 'Luoyang', country: '中国', province: '河南', lng: 112.45, lat: 34.62, tz: 8 },
  { name: '开封', nameEn: 'Kaifeng', country: '中国', province: '河南', lng: 114.35, lat: 34.79, tz: 8 },
  { name: '平顶山', nameEn: 'Pingdingshan', country: '中国', province: '河南', lng: 113.19, lat: 33.77, tz: 8 },
  { name: '安阳', nameEn: 'Anyang', country: '中国', province: '河南', lng: 114.39, lat: 36.10, tz: 8 },
  { name: '新乡', nameEn: 'Xinxiang', country: '中国', province: '河南', lng: 113.88, lat: 35.30, tz: 8 },
  { name: '焦作', nameEn: 'Jiaozuo', country: '中国', province: '河南', lng: 113.24, lat: 35.22, tz: 8 },
  { name: '许昌', nameEn: 'Xuchang', country: '中国', province: '河南', lng: 113.85, lat: 34.04, tz: 8 },
  { name: '南阳', nameEn: 'Nanyang', country: '中国', province: '河南', lng: 112.53, lat: 33.00, tz: 8 },
  { name: '商丘', nameEn: 'Shangqiu', country: '中国', province: '河南', lng: 115.65, lat: 34.44, tz: 8 },
  { name: '信阳', nameEn: 'Xinyang', country: '中国', province: '河南', lng: 114.07, lat: 32.13, tz: 8 },
  { name: '周口', nameEn: 'Zhoukou', country: '中国', province: '河南', lng: 114.70, lat: 33.63, tz: 8 },
  { name: '驻马店', nameEn: 'Zhumadian', country: '中国', province: '河南', lng: 114.02, lat: 33.01, tz: 8 },
  { name: '濮阳', nameEn: 'Puyang', country: '中国', province: '河南', lng: 115.03, lat: 35.76, tz: 8 },
  { name: '漯河', nameEn: 'Luohe', country: '中国', province: '河南', lng: 114.02, lat: 33.58, tz: 8 },
  { name: '三门峡', nameEn: 'Sanmenxia', country: '中国', province: '河南', lng: 111.20, lat: 34.77, tz: 8 },
  { name: '鹤壁', nameEn: 'Hebi', country: '中国', province: '河南', lng: 114.30, lat: 35.75, tz: 8 },

  // ============================================================
  // CHINA - Hubei
  // ============================================================
  { name: '宜昌', nameEn: 'Yichang', country: '中国', province: '湖北', lng: 111.29, lat: 30.69, tz: 8 },
  { name: '襄阳', nameEn: 'Xiangyang', country: '中国', province: '湖北', lng: 112.14, lat: 32.04, tz: 8 },
  { name: '十堰', nameEn: 'Shiyan', country: '中国', province: '湖北', lng: 110.80, lat: 32.65, tz: 8 },
  { name: '荆州', nameEn: 'Jingzhou', country: '中国', province: '湖北', lng: 112.24, lat: 30.33, tz: 8 },
  { name: '黄石', nameEn: 'Huangshi', country: '中国', province: '湖北', lng: 115.04, lat: 30.20, tz: 8 },
  { name: '荆门', nameEn: 'Jingmen', country: '中国', province: '湖北', lng: 112.20, lat: 31.04, tz: 8 },
  { name: '孝感', nameEn: 'Xiaogan', country: '中国', province: '湖北', lng: 113.92, lat: 30.92, tz: 8 },
  { name: '黄冈', nameEn: 'Huanggang', country: '中国', province: '湖北', lng: 114.87, lat: 30.45, tz: 8 },
  { name: '咸宁', nameEn: 'Xianning', country: '中国', province: '湖北', lng: 114.32, lat: 29.84, tz: 8 },
  { name: '恩施', nameEn: 'Enshi', country: '中国', province: '湖北', lng: 109.49, lat: 30.27, tz: 8 },
  { name: '随州', nameEn: 'Suizhou', country: '中国', province: '湖北', lng: 113.38, lat: 31.69, tz: 8 },

  // ============================================================
  // CHINA - Hunan
  // ============================================================
  { name: '株洲', nameEn: 'Zhuzhou', country: '中国', province: '湖南', lng: 113.13, lat: 27.83, tz: 8 },
  { name: '湘潭', nameEn: 'Xiangtan', country: '中国', province: '湖南', lng: 112.94, lat: 27.83, tz: 8 },
  { name: '衡阳', nameEn: 'Hengyang', country: '中国', province: '湖南', lng: 112.57, lat: 26.89, tz: 8 },
  { name: '邵阳', nameEn: 'Shaoyang', country: '中国', province: '湖南', lng: 111.47, lat: 27.24, tz: 8 },
  { name: '岳阳', nameEn: 'Yueyang', country: '中国', province: '湖南', lng: 113.13, lat: 29.37, tz: 8 },
  { name: '常德', nameEn: 'Changde', country: '中国', province: '湖南', lng: 111.70, lat: 29.03, tz: 8 },
  { name: '益阳', nameEn: 'Yiyang', country: '中国', province: '湖南', lng: 112.36, lat: 28.55, tz: 8 },
  { name: '郴州', nameEn: 'Chenzhou', country: '中国', province: '湖南', lng: 113.01, lat: 25.77, tz: 8 },
  { name: '永州', nameEn: 'Yongzhou', country: '中国', province: '湖南', lng: 111.61, lat: 26.42, tz: 8 },
  { name: '怀化', nameEn: 'Huaihua', country: '中国', province: '湖南', lng: 110.00, lat: 27.57, tz: 8 },
  { name: '娄底', nameEn: 'Loudi', country: '中国', province: '湖南', lng: 112.00, lat: 27.73, tz: 8 },
  { name: '张家界', nameEn: 'Zhangjiajie', country: '中国', province: '湖南', lng: 110.48, lat: 29.12, tz: 8 },
  { name: '湘西', nameEn: 'Xiangxi', country: '中国', province: '湖南', lng: 109.74, lat: 28.31, tz: 8 },

  // ============================================================
  // CHINA - Guangdong
  // ============================================================
  { name: '深圳', nameEn: 'Shenzhen', country: '中国', province: '广东', lng: 114.06, lat: 22.55, tz: 8 },
  { name: '珠海', nameEn: 'Zhuhai', country: '中国', province: '广东', lng: 113.58, lat: 22.27, tz: 8 },
  { name: '汕头', nameEn: 'Shantou', country: '中国', province: '广东', lng: 116.68, lat: 23.35, tz: 8 },
  { name: '佛山', nameEn: 'Foshan', country: '中国', province: '广东', lng: 113.12, lat: 23.02, tz: 8 },
  { name: '韶关', nameEn: 'Shaoguan', country: '中国', province: '广东', lng: 113.60, lat: 24.81, tz: 8 },
  { name: '湛江', nameEn: 'Zhanjiang', country: '中国', province: '广东', lng: 110.36, lat: 21.27, tz: 8 },
  { name: '江门', nameEn: 'Jiangmen', country: '中国', province: '广东', lng: 113.08, lat: 22.58, tz: 8 },
  { name: '茂名', nameEn: 'Maoming', country: '中国', province: '广东', lng: 110.93, lat: 21.66, tz: 8 },
  { name: '肇庆', nameEn: 'Zhaoqing', country: '中国', province: '广东', lng: 112.47, lat: 23.05, tz: 8 },
  { name: '惠州', nameEn: 'Huizhou', country: '中国', province: '广东', lng: 114.42, lat: 23.11, tz: 8 },
  { name: '梅州', nameEn: 'Meizhou', country: '中国', province: '广东', lng: 116.12, lat: 24.29, tz: 8 },
  { name: '汕尾', nameEn: 'Shanwei', country: '中国', province: '广东', lng: 115.36, lat: 22.77, tz: 8 },
  { name: '河源', nameEn: 'Heyuan', country: '中国', province: '广东', lng: 114.70, lat: 23.74, tz: 8 },
  { name: '阳江', nameEn: 'Yangjiang', country: '中国', province: '广东', lng: 111.98, lat: 21.86, tz: 8 },
  { name: '清远', nameEn: 'Qingyuan', country: '中国', province: '广东', lng: 113.06, lat: 23.68, tz: 8 },
  { name: '东莞', nameEn: 'Dongguan', country: '中国', province: '广东', lng: 113.75, lat: 23.04, tz: 8 },
  { name: '中山', nameEn: 'Zhongshan', country: '中国', province: '广东', lng: 113.38, lat: 22.52, tz: 8 },
  { name: '潮州', nameEn: 'Chaozhou', country: '中国', province: '广东', lng: 116.63, lat: 23.66, tz: 8 },
  { name: '揭阳', nameEn: 'Jieyang', country: '中国', province: '广东', lng: 116.37, lat: 23.55, tz: 8 },
  { name: '云浮', nameEn: 'Yunfu', country: '中国', province: '广东', lng: 112.04, lat: 22.93, tz: 8 },

  // ============================================================
  // CHINA - Guangxi
  // ============================================================
  { name: '柳州', nameEn: 'Liuzhou', country: '中国', province: '广西', lng: 109.41, lat: 24.33, tz: 8 },
  { name: '桂林', nameEn: 'Guilin', country: '中国', province: '广西', lng: 110.29, lat: 25.27, tz: 8 },
  { name: '梧州', nameEn: 'Wuzhou', country: '中国', province: '广西', lng: 111.28, lat: 23.47, tz: 8 },
  { name: '北海', nameEn: 'Beihai', country: '中国', province: '广西', lng: 109.12, lat: 21.48, tz: 8 },
  { name: '玉林', nameEn: 'Yulin', country: '中国', province: '广西', lng: 110.15, lat: 22.63, tz: 8 },
  { name: '百色', nameEn: 'Baise', country: '中国', province: '广西', lng: 106.62, lat: 23.90, tz: 8 },
  { name: '贵港', nameEn: 'Guigang', country: '中国', province: '广西', lng: 109.60, lat: 23.10, tz: 8 },
  { name: '钦州', nameEn: 'Qinzhou', country: '中国', province: '广西', lng: 108.62, lat: 21.95, tz: 8 },
  { name: '河池', nameEn: 'Hechi', country: '中国', province: '广西', lng: 108.09, lat: 24.69, tz: 8 },
  { name: '来宾', nameEn: 'Laibin', country: '中国', province: '广西', lng: 109.23, lat: 23.73, tz: 8 },

  // ============================================================
  // CHINA - Hainan
  // ============================================================
  { name: '三亚', nameEn: 'Sanya', country: '中国', province: '海南', lng: 109.51, lat: 18.25, tz: 8 },
  { name: '三沙', nameEn: 'Sansha', country: '中国', province: '海南', lng: 112.35, lat: 16.83, tz: 8 },
  { name: '儋州', nameEn: 'Danzhou', country: '中国', province: '海南', lng: 109.58, lat: 19.52, tz: 8 },

  // ============================================================
  // CHINA - Sichuan
  // ============================================================
  { name: '绵阳', nameEn: 'Mianyang', country: '中国', province: '四川', lng: 104.73, lat: 31.47, tz: 8 },
  { name: '自贡', nameEn: 'Zigong', country: '中国', province: '四川', lng: 104.77, lat: 29.34, tz: 8 },
  { name: '攀枝花', nameEn: 'Panzhihua', country: '中国', province: '四川', lng: 101.72, lat: 26.58, tz: 8 },
  { name: '泸州', nameEn: 'Luzhou', country: '中国', province: '四川', lng: 105.44, lat: 28.87, tz: 8 },
  { name: '德阳', nameEn: 'Deyang', country: '中国', province: '四川', lng: 104.40, lat: 31.13, tz: 8 },
  { name: '遂宁', nameEn: 'Suining', country: '中国', province: '四川', lng: 105.59, lat: 30.53, tz: 8 },
  { name: '内江', nameEn: 'Neijiang', country: '中国', province: '四川', lng: 105.06, lat: 29.58, tz: 8 },
  { name: '乐山', nameEn: 'Leshan', country: '中国', province: '四川', lng: 103.77, lat: 29.57, tz: 8 },
  { name: '南充', nameEn: 'Nanchong', country: '中国', province: '四川', lng: 106.07, lat: 30.80, tz: 8 },
  { name: '宜宾', nameEn: 'Yibin', country: '中国', province: '四川', lng: 104.64, lat: 28.75, tz: 8 },
  { name: '广安', nameEn: 'Guangan', country: '中国', province: '四川', lng: 106.63, lat: 30.46, tz: 8 },
  { name: '达州', nameEn: 'Dazhou', country: '中国', province: '四川', lng: 107.50, lat: 31.21, tz: 8 },
  { name: '眉山', nameEn: 'Meishan', country: '中国', province: '四川', lng: 103.85, lat: 30.08, tz: 8 },
  { name: '资阳', nameEn: 'Ziyang', country: '中国', province: '四川', lng: 104.63, lat: 30.13, tz: 8 },
  { name: '巴中', nameEn: 'Bazhong', country: '中国', province: '四川', lng: 106.76, lat: 31.87, tz: 8 },
  { name: '雅安', nameEn: 'Yaan', country: '中国', province: '四川', lng: 103.04, lat: 30.01, tz: 8 },
  { name: '广元', nameEn: 'Guangyuan', country: '中国', province: '四川', lng: 105.84, lat: 32.44, tz: 8 },

  // ============================================================
  // CHINA - Guizhou
  // ============================================================
  { name: '遵义', nameEn: 'Zunyi', country: '中国', province: '贵州', lng: 106.93, lat: 27.73, tz: 8 },
  { name: '六盘水', nameEn: 'Liupanshui', country: '中国', province: '贵州', lng: 104.83, lat: 26.59, tz: 8 },
  { name: '安顺', nameEn: 'Anshun', country: '中国', province: '贵州', lng: 105.93, lat: 26.25, tz: 8 },
  { name: '毕节', nameEn: 'Bijie', country: '中国', province: '贵州', lng: 105.28, lat: 27.30, tz: 8 },
  { name: '铜仁', nameEn: 'Tongren', country: '中国', province: '贵州', lng: 109.19, lat: 27.73, tz: 8 },
  { name: '凯里', nameEn: 'Kaili', country: '中国', province: '贵州', lng: 107.98, lat: 26.57, tz: 8 },
  { name: '都匀', nameEn: 'Duyun', country: '中国', province: '贵州', lng: 107.52, lat: 26.26, tz: 8 },
  { name: '兴义', nameEn: 'Xingyi', country: '中国', province: '贵州', lng: 104.90, lat: 25.09, tz: 8 },

  // ============================================================
  // CHINA - Yunnan
  // ============================================================
  { name: '曲靖', nameEn: 'Qujing', country: '中国', province: '云南', lng: 103.80, lat: 25.49, tz: 8 },
  { name: '玉溪', nameEn: 'Yuxi', country: '中国', province: '云南', lng: 102.55, lat: 24.35, tz: 8 },
  { name: '保山', nameEn: 'Baoshan', country: '中国', province: '云南', lng: 99.17, lat: 25.11, tz: 8 },
  { name: '昭通', nameEn: 'Zhaotong', country: '中国', province: '云南', lng: 103.72, lat: 27.34, tz: 8 },
  { name: '丽江', nameEn: 'Lijiang', country: '中国', province: '云南', lng: 100.23, lat: 26.86, tz: 8 },
  { name: '大理', nameEn: 'Dali', country: '中国', province: '云南', lng: 100.24, lat: 25.59, tz: 8 },
  { name: '红河', nameEn: 'Honghe', country: '中国', province: '云南', lng: 103.38, lat: 23.36, tz: 8 },
  { name: '文山', nameEn: 'Wenshan', country: '中国', province: '云南', lng: 104.24, lat: 23.37, tz: 8 },
  { name: '西双版纳', nameEn: 'Xishuangbanna', country: '中国', province: '云南', lng: 100.80, lat: 22.01, tz: 8 },
  { name: '德宏', nameEn: 'Dehong', country: '中国', province: '云南', lng: 98.58, lat: 24.44, tz: 8 },
  { name: '临沧', nameEn: 'Lincang', country: '中国', province: '云南', lng: 100.09, lat: 23.88, tz: 8 },
  { name: '普洱', nameEn: 'Puer', country: '中国', province: '云南', lng: 101.04, lat: 22.78, tz: 8 },

  // ============================================================
  // CHINA - Shaanxi
  // ============================================================
  { name: '咸阳', nameEn: 'Xianyang', country: '中国', province: '陕西', lng: 108.71, lat: 34.33, tz: 8 },
  { name: '宝鸡', nameEn: 'Baoji', country: '中国', province: '陕西', lng: 107.14, lat: 34.37, tz: 8 },
  { name: '渭南', nameEn: 'Weinan', country: '中国', province: '陕西', lng: 109.50, lat: 34.50, tz: 8 },
  { name: '汉中', nameEn: 'Hanzhong', country: '中国', province: '陕西', lng: 107.03, lat: 33.07, tz: 8 },
  { name: '安康', nameEn: 'Ankang', country: '中国', province: '陕西', lng: 109.03, lat: 32.68, tz: 8 },
  { name: '商洛', nameEn: 'Shangluo', country: '中国', province: '陕西', lng: 109.94, lat: 33.87, tz: 8 },
  { name: '延安', nameEn: 'Yanan', country: '中国', province: '陕西', lng: 109.49, lat: 36.59, tz: 8 },
  { name: '榆林', nameEn: 'Yulin', country: '中国', province: '陕西', lng: 109.73, lat: 38.28, tz: 8 },
  { name: '铜川', nameEn: 'Tongchuan', country: '中国', province: '陕西', lng: 108.95, lat: 34.90, tz: 8 },

  // ============================================================
  // CHINA - Gansu
  // ============================================================
  { name: '天水', nameEn: 'Tianshui', country: '中国', province: '甘肃', lng: 105.72, lat: 34.58, tz: 8 },
  { name: '白银', nameEn: 'Baiyin', country: '中国', province: '甘肃', lng: 104.14, lat: 36.55, tz: 8 },
  { name: '武威', nameEn: 'Wuwei', country: '中国', province: '甘肃', lng: 102.64, lat: 37.93, tz: 8 },
  { name: '张掖', nameEn: 'Zhangye', country: '中国', province: '甘肃', lng: 100.45, lat: 38.93, tz: 8 },
  { name: '酒泉', nameEn: 'Jiuquan', country: '中国', province: '甘肃', lng: 98.51, lat: 39.74, tz: 8 },
  { name: '庆阳', nameEn: 'Qingyang', country: '中国', province: '甘肃', lng: 107.64, lat: 35.73, tz: 8 },
  { name: '平凉', nameEn: 'Pingliang', country: '中国', province: '甘肃', lng: 106.66, lat: 35.54, tz: 8 },
  { name: '定西', nameEn: 'Dingxi', country: '中国', province: '甘肃', lng: 104.59, lat: 35.58, tz: 8 },
  { name: '陇南', nameEn: 'Longnan', country: '中国', province: '甘肃', lng: 104.92, lat: 33.39, tz: 8 },
  { name: '嘉峪关', nameEn: 'Jiayuguan', country: '中国', province: '甘肃', lng: 98.29, lat: 39.77, tz: 8 },
  { name: '金昌', nameEn: 'Jinchang', country: '中国', province: '甘肃', lng: 102.19, lat: 38.52, tz: 8 },

  // ============================================================
  // CHINA - Qinghai
  // ============================================================
  { name: '海东', nameEn: 'Haidong', country: '中国', province: '青海', lng: 102.10, lat: 36.50, tz: 8 },
  { name: '格尔木', nameEn: 'Golmud', country: '中国', province: '青海', lng: 94.90, lat: 36.41, tz: 8 },

  // ============================================================
  // CHINA - Ningxia
  // ============================================================
  { name: '石嘴山', nameEn: 'Shizuishan', country: '中国', province: '宁夏', lng: 106.38, lat: 39.02, tz: 8 },
  { name: '吴忠', nameEn: 'Wuzhong', country: '中国', province: '宁夏', lng: 106.20, lat: 37.99, tz: 8 },
  { name: '固原', nameEn: 'Guyuan', country: '中国', province: '宁夏', lng: 106.24, lat: 36.01, tz: 8 },
  { name: '中卫', nameEn: 'Zhongwei', country: '中国', province: '宁夏', lng: 105.20, lat: 37.51, tz: 8 },

  // ============================================================
  // CHINA - Xinjiang
  // ============================================================
  { name: '克拉玛依', nameEn: 'Karamay', country: '中国', province: '新疆', lng: 84.86, lat: 45.59, tz: 8 },
  { name: '喀什', nameEn: 'Kashgar', country: '中国', province: '新疆', lng: 75.99, lat: 39.47, tz: 8 },
  { name: '伊宁', nameEn: 'Yining', country: '中国', province: '新疆', lng: 81.33, lat: 43.91, tz: 8 },
  { name: '库尔勒', nameEn: 'Korla', country: '中国', province: '新疆', lng: 86.15, lat: 41.76, tz: 8 },
  { name: '阿克苏', nameEn: 'Aksu', country: '中国', province: '新疆', lng: 80.26, lat: 41.17, tz: 8 },
  { name: '哈密', nameEn: 'Hami', country: '中国', province: '新疆', lng: 93.51, lat: 42.83, tz: 8 },
  { name: '吐鲁番', nameEn: 'Turpan', country: '中国', province: '新疆', lng: 89.19, lat: 42.95, tz: 8 },
  { name: '和田', nameEn: 'Hotan', country: '中国', province: '新疆', lng: 79.93, lat: 37.11, tz: 8 },
  { name: '昌吉', nameEn: 'Changji', country: '中国', province: '新疆', lng: 87.31, lat: 44.01, tz: 8 },
  { name: '石河子', nameEn: 'Shihezi', country: '中国', province: '新疆', lng: 86.04, lat: 44.31, tz: 8 },

  // ============================================================
  // CHINA - Tibet
  // ============================================================
  { name: '日喀则', nameEn: 'Shigatse', country: '中国', province: '西藏', lng: 88.88, lat: 29.27, tz: 8 },
  { name: '林芝', nameEn: 'Nyingchi', country: '中国', province: '西藏', lng: 94.36, lat: 29.65, tz: 8 },
  { name: '昌都', nameEn: 'Chamdo', country: '中国', province: '西藏', lng: 97.17, lat: 31.14, tz: 8 },

  // ============================================================
  // CHINA - Taiwan (additional cities)
  // ============================================================
  { name: '高雄', nameEn: 'Kaohsiung', country: '中国', province: '台湾', lng: 120.31, lat: 22.62, tz: 8 },
  { name: '台中', nameEn: 'Taichung', country: '中国', province: '台湾', lng: 120.68, lat: 24.15, tz: 8 },
  { name: '台南', nameEn: 'Tainan', country: '中国', province: '台湾', lng: 120.23, lat: 23.00, tz: 8 },
  { name: '新竹', nameEn: 'Hsinchu', country: '中国', province: '台湾', lng: 120.97, lat: 24.80, tz: 8 },
  { name: '基隆', nameEn: 'Keelung', country: '中国', province: '台湾', lng: 121.74, lat: 25.13, tz: 8 },
  { name: '花莲', nameEn: 'Hualien', country: '中国', province: '台湾', lng: 121.60, lat: 23.99, tz: 8 },

  // ============================================================
  // EAST ASIA
  // ============================================================
  // Japan
  { name: '东京', nameEn: 'Tokyo', country: '日本', province: '', lng: 139.69, lat: 35.69, tz: 9 },
  { name: '大阪', nameEn: 'Osaka', country: '日本', province: '', lng: 135.50, lat: 34.69, tz: 9 },
  { name: '京都', nameEn: 'Kyoto', country: '日本', province: '', lng: 135.77, lat: 35.01, tz: 9 },
  { name: '横滨', nameEn: 'Yokohama', country: '日本', province: '', lng: 139.64, lat: 35.44, tz: 9 },
  { name: '名古屋', nameEn: 'Nagoya', country: '日本', province: '', lng: 136.91, lat: 35.18, tz: 9 },
  { name: '札幌', nameEn: 'Sapporo', country: '日本', province: '', lng: 141.35, lat: 43.06, tz: 9 },
  { name: '福冈', nameEn: 'Fukuoka', country: '日本', province: '', lng: 130.42, lat: 33.59, tz: 9 },
  { name: '神户', nameEn: 'Kobe', country: '日本', province: '', lng: 135.19, lat: 34.69, tz: 9 },
  { name: '广岛', nameEn: 'Hiroshima', country: '日本', province: '', lng: 132.46, lat: 34.39, tz: 9 },
  { name: '那霸', nameEn: 'Naha', country: '日本', province: '', lng: 127.68, lat: 26.34, tz: 9 },

  // South Korea
  { name: '首尔', nameEn: 'Seoul', country: '韩国', province: '', lng: 126.98, lat: 37.57, tz: 9 },
  { name: '釜山', nameEn: 'Busan', country: '韩国', province: '', lng: 129.04, lat: 35.18, tz: 9 },
  { name: '仁川', nameEn: 'Incheon', country: '韩国', province: '', lng: 126.71, lat: 37.46, tz: 9 },
  { name: '大邱', nameEn: 'Daegu', country: '韩国', province: '', lng: 128.60, lat: 35.87, tz: 9 },
  { name: '大田', nameEn: 'Daejeon', country: '韩国', province: '', lng: 127.38, lat: 36.35, tz: 9 },
  { name: '济州', nameEn: 'Jeju', country: '韩国', province: '', lng: 126.53, lat: 33.51, tz: 9 },

  // North Korea
  { name: '平壤', nameEn: 'Pyongyang', country: '朝鲜', province: '', lng: 125.75, lat: 39.02, tz: 9 },

  // Mongolia
  { name: '乌兰巴托', nameEn: 'Ulaanbaatar', country: '蒙古', province: '', lng: 106.91, lat: 47.92, tz: 8 },

  // ============================================================
  // SOUTHEAST ASIA
  // ============================================================
  { name: '曼谷', nameEn: 'Bangkok', country: '泰国', province: '', lng: 100.50, lat: 13.76, tz: 7 },
  { name: '清迈', nameEn: 'Chiang Mai', country: '泰国', province: '', lng: 98.98, lat: 18.79, tz: 7 },
  { name: '普吉', nameEn: 'Phuket', country: '泰国', province: '', lng: 98.39, lat: 7.88, tz: 7 },
  { name: '河内', nameEn: 'Hanoi', country: '越南', province: '', lng: 105.85, lat: 21.03, tz: 7 },
  { name: '胡志明市', nameEn: 'Ho Chi Minh City', country: '越南', province: '', lng: 106.63, lat: 10.82, tz: 7 },
  { name: '岘港', nameEn: 'Da Nang', country: '越南', province: '', lng: 108.22, lat: 16.07, tz: 7 },
  { name: '新加坡', nameEn: 'Singapore', country: '新加坡', province: '', lng: 103.85, lat: 1.35, tz: 8 },
  { name: '吉隆坡', nameEn: 'Kuala Lumpur', country: '马来西亚', province: '', lng: 101.69, lat: 3.14, tz: 8 },
  { name: '槟城', nameEn: 'Penang', country: '马来西亚', province: '', lng: 100.33, lat: 5.41, tz: 8 },
  { name: '马尼拉', nameEn: 'Manila', country: '菲律宾', province: '', lng: 120.98, lat: 14.60, tz: 8 },
  { name: '宿务', nameEn: 'Cebu', country: '菲律宾', province: '', lng: 123.90, lat: 10.32, tz: 8 },
  { name: '雅加达', nameEn: 'Jakarta', country: '印度尼西亚', province: '', lng: 106.85, lat: -6.21, tz: 7 },
  { name: '巴厘岛', nameEn: 'Bali', country: '印度尼西亚', province: '', lng: 115.19, lat: -8.65, tz: 8 },
  { name: '泗水', nameEn: 'Surabaya', country: '印度尼西亚', province: '', lng: 112.75, lat: -7.25, tz: 7 },
  { name: '金边', nameEn: 'Phnom Penh', country: '柬埔寨', province: '', lng: 104.92, lat: 11.56, tz: 7 },
  { name: '暹粒', nameEn: 'Siem Reap', country: '柬埔寨', province: '', lng: 103.86, lat: 13.36, tz: 7 },
  { name: '仰光', nameEn: 'Yangon', country: '缅甸', province: '', lng: 96.20, lat: 16.87, tz: 6.5 },
  { name: '内比都', nameEn: 'Naypyidaw', country: '缅甸', province: '', lng: 96.13, lat: 19.76, tz: 6.5 },
  { name: '万象', nameEn: 'Vientiane', country: '老挝', province: '', lng: 102.63, lat: 17.97, tz: 7 },
  { name: '帝力', nameEn: 'Dili', country: '东帝汶', province: '', lng: 125.57, lat: -8.56, tz: 9 },
  { name: '斯里巴加湾', nameEn: 'Bandar Seri Begawan', country: '文莱', province: '', lng: 114.95, lat: 4.94, tz: 8 },

  // ============================================================
  // SOUTH ASIA
  // ============================================================
  { name: '新德里', nameEn: 'New Delhi', country: '印度', province: '', lng: 77.21, lat: 28.61, tz: 5.5 },
  { name: '孟买', nameEn: 'Mumbai', country: '印度', province: '', lng: 72.88, lat: 19.08, tz: 5.5 },
  { name: '班加罗尔', nameEn: 'Bangalore', country: '印度', province: '', lng: 77.59, lat: 12.97, tz: 5.5 },
  { name: '加尔各答', nameEn: 'Kolkata', country: '印度', province: '', lng: 88.36, lat: 22.57, tz: 5.5 },
  { name: '钦奈', nameEn: 'Chennai', country: '印度', province: '', lng: 80.27, lat: 13.08, tz: 5.5 },
  { name: '海得拉巴', nameEn: 'Hyderabad', country: '印度', province: '', lng: 78.47, lat: 17.39, tz: 5.5 },
  { name: '艾哈迈达巴德', nameEn: 'Ahmedabad', country: '印度', province: '', lng: 72.57, lat: 23.02, tz: 5.5 },
  { name: '浦那', nameEn: 'Pune', country: '印度', province: '', lng: 73.86, lat: 18.52, tz: 5.5 },
  { name: '伊斯兰堡', nameEn: 'Islamabad', country: '巴基斯坦', province: '', lng: 73.04, lat: 33.69, tz: 5 },
  { name: '卡拉奇', nameEn: 'Karachi', country: '巴基斯坦', province: '', lng: 67.01, lat: 24.86, tz: 5 },
  { name: '拉合尔', nameEn: 'Lahore', country: '巴基斯坦', province: '', lng: 74.35, lat: 31.55, tz: 5 },
  { name: '达卡', nameEn: 'Dhaka', country: '孟加拉国', province: '', lng: 90.41, lat: 23.81, tz: 6 },
  { name: '科伦坡', nameEn: 'Colombo', country: '斯里兰卡', province: '', lng: 79.86, lat: 6.93, tz: 5.5 },
  { name: '加德满都', nameEn: 'Kathmandu', country: '尼泊尔', province: '', lng: 85.32, lat: 27.72, tz: 5.75 },
  { name: '廷布', nameEn: 'Thimphu', country: '不丹', province: '', lng: 89.64, lat: 27.47, tz: 6 },
  { name: '马累', nameEn: 'Male', country: '马尔代夫', province: '', lng: 73.51, lat: 4.18, tz: 5 },

  // ============================================================
  // CENTRAL ASIA
  // ============================================================
  { name: '阿斯塔纳', nameEn: 'Astana', country: '哈萨克斯坦', province: '', lng: 71.43, lat: 51.17, tz: 6 },
  { name: '阿拉木图', nameEn: 'Almaty', country: '哈萨克斯坦', province: '', lng: 76.95, lat: 43.24, tz: 6 },
  { name: '塔什干', nameEn: 'Tashkent', country: '乌兹别克斯坦', province: '', lng: 69.28, lat: 41.30, tz: 5 },
  { name: '比什凯克', nameEn: 'Bishkek', country: '吉尔吉斯斯坦', province: '', lng: 74.59, lat: 42.87, tz: 6 },
  { name: '杜尚别', nameEn: 'Dushanbe', country: '塔吉克斯坦', province: '', lng: 68.77, lat: 38.56, tz: 5 },
  { name: '阿什哈巴德', nameEn: 'Ashgabat', country: '土库曼斯坦', province: '', lng: 58.38, lat: 37.96, tz: 5 },

  // ============================================================
  // WEST ASIA / MIDDLE EAST
  // ============================================================
  { name: '迪拜', nameEn: 'Dubai', country: '阿联酋', province: '', lng: 55.27, lat: 25.20, tz: 4 },
  { name: '阿布扎比', nameEn: 'Abu Dhabi', country: '阿联酋', province: '', lng: 54.37, lat: 24.45, tz: 4 },
  { name: '利雅得', nameEn: 'Riyadh', country: '沙特阿拉伯', province: '', lng: 46.72, lat: 24.69, tz: 3 },
  { name: '吉达', nameEn: 'Jeddah', country: '沙特阿拉伯', province: '', lng: 39.17, lat: 21.49, tz: 3 },
  { name: '麦加', nameEn: 'Mecca', country: '沙特阿拉伯', province: '', lng: 39.83, lat: 21.43, tz: 3 },
  { name: '多哈', nameEn: 'Doha', country: '卡塔尔', province: '', lng: 51.53, lat: 25.29, tz: 3 },
  { name: '科威特城', nameEn: 'Kuwait City', country: '科威特', province: '', lng: 47.98, lat: 29.37, tz: 3 },
  { name: '麦纳麦', nameEn: 'Manama', country: '巴林', province: '', lng: 50.59, lat: 26.23, tz: 3 },
  { name: '马斯喀特', nameEn: 'Muscat', country: '阿曼', province: '', lng: 58.41, lat: 23.59, tz: 4 },
  { name: '安卡拉', nameEn: 'Ankara', country: '土耳其', province: '', lng: 32.87, lat: 39.93, tz: 3 },
  { name: '伊斯坦布尔', nameEn: 'Istanbul', country: '土耳其', province: '', lng: 28.98, lat: 41.01, tz: 3 },
  { name: '德黑兰', nameEn: 'Tehran', country: '伊朗', province: '', lng: 51.39, lat: 35.69, tz: 3.5 },
  { name: '巴格达', nameEn: 'Baghdad', country: '伊拉克', province: '', lng: 44.37, lat: 33.31, tz: 3 },
  { name: '大马士革', nameEn: 'Damascus', country: '叙利亚', province: '', lng: 36.29, lat: 33.51, tz: 3 },
  { name: '贝鲁特', nameEn: 'Beirut', country: '黎巴嫩', province: '', lng: 35.50, lat: 33.89, tz: 2 },
  { name: '安曼', nameEn: 'Amman', country: '约旦', province: '', lng: 35.93, lat: 31.95, tz: 3 },
  { name: '耶路撒冷', nameEn: 'Jerusalem', country: '以色列', province: '', lng: 35.22, lat: 31.77, tz: 2 },
  { name: '特拉维夫', nameEn: 'Tel Aviv', country: '以色列', province: '', lng: 34.78, lat: 32.08, tz: 2 },
  { name: '萨那', nameEn: 'Sanaa', country: '也门', province: '', lng: 44.21, lat: 15.35, tz: 3 },
  { name: '第比利斯', nameEn: 'Tbilisi', country: '格鲁吉亚', province: '', lng: 44.79, lat: 41.72, tz: 4 },
  { name: '埃里温', nameEn: 'Yerevan', country: '亚美尼亚', province: '', lng: 44.51, lat: 40.18, tz: 4 },
  { name: '巴库', nameEn: 'Baku', country: '阿塞拜疆', province: '', lng: 49.87, lat: 40.41, tz: 4 },
  { name: '尼科西亚', nameEn: 'Nicosia', country: '塞浦路斯', province: '', lng: 33.38, lat: 35.17, tz: 2 },

  // ============================================================
  // EUROPE - Western
  // ============================================================
  { name: '伦敦', nameEn: 'London', country: '英国', province: '', lng: -0.12, lat: 51.51, tz: 0 },
  { name: '曼彻斯特', nameEn: 'Manchester', country: '英国', province: '', lng: -2.24, lat: 53.48, tz: 0 },
  { name: '爱丁堡', nameEn: 'Edinburgh', country: '英国', province: '', lng: -3.19, lat: 55.95, tz: 0 },
  { name: '伯明翰', nameEn: 'Birmingham', country: '英国', province: '', lng: -1.90, lat: 52.49, tz: 0 },
  { name: '巴黎', nameEn: 'Paris', country: '法国', province: '', lng: 2.35, lat: 48.86, tz: 1 },
  { name: '马赛', nameEn: 'Marseille', country: '法国', province: '', lng: 5.37, lat: 43.30, tz: 1 },
  { name: '里昂', nameEn: 'Lyon', country: '法国', province: '', lng: 4.83, lat: 45.76, tz: 1 },
  { name: '柏林', nameEn: 'Berlin', country: '德国', province: '', lng: 13.41, lat: 52.52, tz: 1 },
  { name: '慕尼黑', nameEn: 'Munich', country: '德国', province: '', lng: 11.58, lat: 48.14, tz: 1 },
  { name: '法兰克福', nameEn: 'Frankfurt', country: '德国', province: '', lng: 8.68, lat: 50.11, tz: 1 },
  { name: '汉堡', nameEn: 'Hamburg', country: '德国', province: '', lng: 9.99, lat: 53.55, tz: 1 },
  { name: '阿姆斯特丹', nameEn: 'Amsterdam', country: '荷兰', province: '', lng: 4.90, lat: 52.37, tz: 1 },
  { name: '布鲁塞尔', nameEn: 'Brussels', country: '比利时', province: '', lng: 4.35, lat: 50.85, tz: 1 },
  { name: '卢森堡', nameEn: 'Luxembourg', country: '卢森堡', province: '', lng: 6.13, lat: 49.61, tz: 1 },
  { name: '苏黎世', nameEn: 'Zurich', country: '瑞士', province: '', lng: 8.54, lat: 47.38, tz: 1 },
  { name: '日内瓦', nameEn: 'Geneva', country: '瑞士', province: '', lng: 6.14, lat: 46.20, tz: 1 },
  { name: '维也纳', nameEn: 'Vienna', country: '奥地利', province: '', lng: 16.37, lat: 48.21, tz: 1 },
  { name: '都柏林', nameEn: 'Dublin', country: '爱尔兰', province: '', lng: -6.26, lat: 53.34, tz: 0 },

  // ============================================================
  // EUROPE - Southern
  // ============================================================
  { name: '罗马', nameEn: 'Rome', country: '意大利', province: '', lng: 12.50, lat: 41.90, tz: 1 },
  { name: '米兰', nameEn: 'Milan', country: '意大利', province: '', lng: 9.19, lat: 45.46, tz: 1 },
  { name: '马德里', nameEn: 'Madrid', country: '西班牙', province: '', lng: -3.70, lat: 40.42, tz: 1 },
  { name: '巴塞罗那', nameEn: 'Barcelona', country: '西班牙', province: '', lng: 2.17, lat: 41.39, tz: 1 },
  { name: '里斯本', nameEn: 'Lisbon', country: '葡萄牙', province: '', lng: -9.14, lat: 38.72, tz: 0 },
  { name: '雅典', nameEn: 'Athens', country: '希腊', province: '', lng: 23.73, lat: 37.98, tz: 2 },

  // ============================================================
  // EUROPE - Northern
  // ============================================================
  { name: '斯德哥尔摩', nameEn: 'Stockholm', country: '瑞典', province: '', lng: 18.07, lat: 59.33, tz: 1 },
  { name: '奥斯陆', nameEn: 'Oslo', country: '挪威', province: '', lng: 10.75, lat: 59.91, tz: 1 },
  { name: '哥本哈根', nameEn: 'Copenhagen', country: '丹麦', province: '', lng: 12.57, lat: 55.68, tz: 1 },
  { name: '赫尔辛基', nameEn: 'Helsinki', country: '芬兰', province: '', lng: 24.94, lat: 60.17, tz: 2 },
  { name: '雷克雅未克', nameEn: 'Reykjavik', country: '冰岛', province: '', lng: -21.90, lat: 64.15, tz: 0 },

  // ============================================================
  // EUROPE - Eastern
  // ============================================================
  { name: '莫斯科', nameEn: 'Moscow', country: '俄罗斯', province: '', lng: 37.62, lat: 55.76, tz: 3 },
  { name: '圣彼得堡', nameEn: 'Saint Petersburg', country: '俄罗斯', province: '', lng: 30.32, lat: 59.93, tz: 3 },
  { name: '新西伯利亚', nameEn: 'Novosibirsk', country: '俄罗斯', province: '', lng: 82.92, lat: 55.01, tz: 7 },
  { name: '叶卡捷琳堡', nameEn: 'Yekaterinburg', country: '俄罗斯', province: '', lng: 60.61, lat: 56.84, tz: 5 },
  { name: '海参崴', nameEn: 'Vladivostok', country: '俄罗斯', province: '', lng: 131.89, lat: 43.12, tz: 10 },
  { name: '华沙', nameEn: 'Warsaw', country: '波兰', province: '', lng: 21.01, lat: 52.23, tz: 1 },
  { name: '布拉格', nameEn: 'Prague', country: '捷克', province: '', lng: 14.42, lat: 50.08, tz: 1 },
  { name: '布达佩斯', nameEn: 'Budapest', country: '匈牙利', province: '', lng: 19.04, lat: 47.50, tz: 1 },
  { name: '布加勒斯特', nameEn: 'Bucharest', country: '罗马尼亚', province: '', lng: 26.10, lat: 44.43, tz: 2 },
  { name: '索菲亚', nameEn: 'Sofia', country: '保加利亚', province: '', lng: 23.32, lat: 42.70, tz: 2 },
  { name: '贝尔格莱德', nameEn: 'Belgrade', country: '塞尔维亚', province: '', lng: 20.46, lat: 44.79, tz: 1 },
  { name: '萨格勒布', nameEn: 'Zagreb', country: '克罗地亚', province: '', lng: 15.98, lat: 45.81, tz: 1 },
  { name: '基辅', nameEn: 'Kyiv', country: '乌克兰', province: '', lng: 30.52, lat: 50.45, tz: 2 },
  { name: '明斯克', nameEn: 'Minsk', country: '白俄罗斯', province: '', lng: 27.57, lat: 53.90, tz: 3 },
  { name: '布拉迪斯拉发', nameEn: 'Bratislava', country: '斯洛伐克', province: '', lng: 17.11, lat: 48.15, tz: 1 },
  { name: '卢布尔雅那', nameEn: 'Ljubljana', country: '斯洛文尼亚', province: '', lng: 14.51, lat: 46.06, tz: 1 },
  { name: '塔林', nameEn: 'Tallinn', country: '爱沙尼亚', province: '', lng: 24.75, lat: 59.44, tz: 2 },
  { name: '里加', nameEn: 'Riga', country: '拉脱维亚', province: '', lng: 24.11, lat: 56.95, tz: 2 },
  { name: '维尔纽斯', nameEn: 'Vilnius', country: '立陶宛', province: '', lng: 25.28, lat: 54.69, tz: 2 },
  { name: '地拉那', nameEn: 'Tirana', country: '阿尔巴尼亚', province: '', lng: 19.82, lat: 41.33, tz: 1 },

  // ============================================================
  // NORTH AMERICA
  // ============================================================
  // United States
  { name: '华盛顿', nameEn: 'Washington D.C.', country: '美国', province: '', lng: -77.04, lat: 38.91, tz: -5 },
  { name: '纽约', nameEn: 'New York', country: '美国', province: '', lng: -74.01, lat: 40.71, tz: -5 },
  { name: '洛杉矶', nameEn: 'Los Angeles', country: '美国', province: '', lng: -118.24, lat: 34.05, tz: -8 },
  { name: '芝加哥', nameEn: 'Chicago', country: '美国', province: '', lng: -87.63, lat: 41.88, tz: -6 },
  { name: '休斯顿', nameEn: 'Houston', country: '美国', province: '', lng: -95.37, lat: 29.76, tz: -6 },
  { name: '旧金山', nameEn: 'San Francisco', country: '美国', province: '', lng: -122.42, lat: 37.77, tz: -8 },
  { name: '费城', nameEn: 'Philadelphia', country: '美国', province: '', lng: -75.16, lat: 39.95, tz: -5 },
  { name: '达拉斯', nameEn: 'Dallas', country: '美国', province: '', lng: -96.80, lat: 32.78, tz: -6 },
  { name: '波士顿', nameEn: 'Boston', country: '美国', province: '', lng: -71.06, lat: 42.36, tz: -5 },
  { name: '亚特兰大', nameEn: 'Atlanta', country: '美国', province: '', lng: -84.39, lat: 33.75, tz: -5 },
  { name: '迈阿密', nameEn: 'Miami', country: '美国', province: '', lng: -80.19, lat: 25.76, tz: -5 },
  { name: '西雅图', nameEn: 'Seattle', country: '美国', province: '', lng: -122.33, lat: 47.61, tz: -8 },
  { name: '丹佛', nameEn: 'Denver', country: '美国', province: '', lng: -104.99, lat: 39.74, tz: -7 },
  { name: '拉斯维加斯', nameEn: 'Las Vegas', country: '美国', province: '', lng: -115.14, lat: 36.17, tz: -8 },
  { name: '凤凰城', nameEn: 'Phoenix', country: '美国', province: '', lng: -112.07, lat: 33.45, tz: -7 },
  { name: '底特律', nameEn: 'Detroit', country: '美国', province: '', lng: -83.05, lat: 42.33, tz: -5 },
  { name: '明尼阿波利斯', nameEn: 'Minneapolis', country: '美国', province: '', lng: -93.27, lat: 44.98, tz: -6 },
  { name: '圣地亚哥', nameEn: 'San Diego', country: '美国', province: '', lng: -117.16, lat: 32.72, tz: -8 },
  { name: '夏威夷火奴鲁鲁', nameEn: 'Honolulu', country: '美国', province: '', lng: -157.86, lat: 21.31, tz: -10 },
  { name: '安克雷奇', nameEn: 'Anchorage', country: '美国', province: '', lng: -149.90, lat: 61.22, tz: -9 },

  // Canada
  { name: '渥太华', nameEn: 'Ottawa', country: '加拿大', province: '', lng: -75.70, lat: 45.42, tz: -5 },
  { name: '多伦多', nameEn: 'Toronto', country: '加拿大', province: '', lng: -79.38, lat: 43.65, tz: -5 },
  { name: '温哥华', nameEn: 'Vancouver', country: '加拿大', province: '', lng: -123.12, lat: 49.28, tz: -8 },
  { name: '蒙特利尔', nameEn: 'Montreal', country: '加拿大', province: '', lng: -73.57, lat: 45.50, tz: -5 },
  { name: '卡尔加里', nameEn: 'Calgary', country: '加拿大', province: '', lng: -114.07, lat: 51.05, tz: -7 },
  { name: '埃德蒙顿', nameEn: 'Edmonton', country: '加拿大', province: '', lng: -113.49, lat: 53.54, tz: -7 },

  // Mexico
  { name: '墨西哥城', nameEn: 'Mexico City', country: '墨西哥', province: '', lng: -99.13, lat: 19.43, tz: -6 },
  { name: '坎昆', nameEn: 'Cancun', country: '墨西哥', province: '', lng: -86.85, lat: 21.16, tz: -5 },
  { name: '瓜达拉哈拉', nameEn: 'Guadalajara', country: '墨西哥', province: '', lng: -103.35, lat: 20.67, tz: -6 },
  { name: '蒙特雷', nameEn: 'Monterrey', country: '墨西哥', province: '', lng: -100.31, lat: 25.67, tz: -6 },

  // Central America & Caribbean
  { name: '哈瓦那', nameEn: 'Havana', country: '古巴', province: '', lng: -82.37, lat: 23.11, tz: -5 },
  { name: '圣何塞', nameEn: 'San Jose', country: '哥斯达黎加', province: '', lng: -84.09, lat: 9.93, tz: -6 },
  { name: '巴拿马城', nameEn: 'Panama City', country: '巴拿马', province: '', lng: -79.52, lat: 8.98, tz: -5 },
  { name: '金斯敦', nameEn: 'Kingston', country: '牙买加', province: '', lng: -76.79, lat: 18.00, tz: -5 },
  { name: '危地马拉城', nameEn: 'Guatemala City', country: '危地马拉', province: '', lng: -90.53, lat: 14.63, tz: -6 },

  // ============================================================
  // SOUTH AMERICA
  // ============================================================
  { name: '巴西利亚', nameEn: 'Brasilia', country: '巴西', province: '', lng: -47.88, lat: -15.79, tz: -3 },
  { name: '圣保罗', nameEn: 'Sao Paulo', country: '巴西', province: '', lng: -46.63, lat: -23.55, tz: -3 },
  { name: '里约热内卢', nameEn: 'Rio de Janeiro', country: '巴西', province: '', lng: -43.17, lat: -22.91, tz: -3 },
  { name: '布宜诺斯艾利斯', nameEn: 'Buenos Aires', country: '阿根廷', province: '', lng: -58.38, lat: -34.60, tz: -3 },
  { name: '圣地亚哥', nameEn: 'Santiago', country: '智利', province: '', lng: -70.65, lat: -33.45, tz: -4 },
  { name: '利马', nameEn: 'Lima', country: '秘鲁', province: '', lng: -77.03, lat: -12.05, tz: -5 },
  { name: '波哥大', nameEn: 'Bogota', country: '哥伦比亚', province: '', lng: -74.07, lat: 4.71, tz: -5 },
  { name: '加拉加斯', nameEn: 'Caracas', country: '委内瑞拉', province: '', lng: -66.90, lat: 10.48, tz: -4 },
  { name: '基多', nameEn: 'Quito', country: '厄瓜多尔', province: '', lng: -78.52, lat: -0.18, tz: -5 },
  { name: '蒙得维的亚', nameEn: 'Montevideo', country: '乌拉圭', province: '', lng: -56.16, lat: -34.88, tz: -3 },
  { name: '拉巴斯', nameEn: 'La Paz', country: '玻利维亚', province: '', lng: -68.15, lat: -16.49, tz: -4 },
  { name: '亚松森', nameEn: 'Asuncion', country: '巴拉圭', province: '', lng: -57.58, lat: -25.26, tz: -4 },
  { name: '麦德林', nameEn: 'Medellin', country: '哥伦比亚', province: '', lng: -75.57, lat: 6.25, tz: -5 },

  // ============================================================
  // AFRICA - North
  // ============================================================
  { name: '开罗', nameEn: 'Cairo', country: '埃及', province: '', lng: 31.24, lat: 30.04, tz: 2 },
  { name: '亚历山大', nameEn: 'Alexandria', country: '埃及', province: '', lng: 29.92, lat: 31.20, tz: 2 },
  { name: '拉巴特', nameEn: 'Rabat', country: '摩洛哥', province: '', lng: -6.85, lat: 34.02, tz: 1 },
  { name: '卡萨布兰卡', nameEn: 'Casablanca', country: '摩洛哥', province: '', lng: -7.59, lat: 33.57, tz: 1 },
  { name: '突尼斯', nameEn: 'Tunis', country: '突尼斯', province: '', lng: 10.17, lat: 36.81, tz: 1 },
  { name: '阿尔及尔', nameEn: 'Algiers', country: '阿尔及利亚', province: '', lng: 3.06, lat: 36.75, tz: 1 },
  { name: '的黎波里', nameEn: 'Tripoli', country: '利比亚', province: '', lng: 13.18, lat: 32.90, tz: 2 },

  // ============================================================
  // AFRICA - West
  // ============================================================
  { name: '拉各斯', nameEn: 'Lagos', country: '尼日利亚', province: '', lng: 3.39, lat: 6.45, tz: 1 },
  { name: '阿布贾', nameEn: 'Abuja', country: '尼日利亚', province: '', lng: 7.49, lat: 9.06, tz: 1 },
  { name: '阿克拉', nameEn: 'Accra', country: '加纳', province: '', lng: -0.19, lat: 5.56, tz: 0 },
  { name: '达喀尔', nameEn: 'Dakar', country: '塞内加尔', province: '', lng: -17.44, lat: 14.69, tz: 0 },
  { name: '阿比让', nameEn: 'Abidjan', country: '科特迪瓦', province: '', lng: -4.01, lat: 5.36, tz: 0 },

  // ============================================================
  // AFRICA - East
  // ============================================================
  { name: '内罗毕', nameEn: 'Nairobi', country: '肯尼亚', province: '', lng: 36.82, lat: -1.29, tz: 3 },
  { name: '亚的斯亚贝巴', nameEn: 'Addis Ababa', country: '埃塞俄比亚', province: '', lng: 38.75, lat: 9.02, tz: 3 },
  { name: '达累斯萨拉姆', nameEn: 'Dar es Salaam', country: '坦桑尼亚', province: '', lng: 39.28, lat: -6.79, tz: 3 },
  { name: '坎帕拉', nameEn: 'Kampala', country: '乌干达', province: '', lng: 32.58, lat: 0.35, tz: 3 },
  { name: '基加利', nameEn: 'Kigali', country: '卢旺达', province: '', lng: 29.87, lat: -1.94, tz: 2 },

  // ============================================================
  // AFRICA - Southern
  // ============================================================
  { name: '约翰内斯堡', nameEn: 'Johannesburg', country: '南非', province: '', lng: 28.05, lat: -26.20, tz: 2 },
  { name: '开普敦', nameEn: 'Cape Town', country: '南非', province: '', lng: 18.42, lat: -33.93, tz: 2 },
  { name: '比勒陀利亚', nameEn: 'Pretoria', country: '南非', province: '', lng: 28.19, lat: -25.75, tz: 2 },
  { name: '德班', nameEn: 'Durban', country: '南非', province: '', lng: 31.02, lat: -29.86, tz: 2 },
  { name: '马普托', nameEn: 'Maputo', country: '莫桑比克', province: '', lng: 32.57, lat: -25.97, tz: 2 },
  { name: '哈拉雷', nameEn: 'Harare', country: '津巴布韦', province: '', lng: 31.05, lat: -17.83, tz: 2 },
  { name: '卢萨卡', nameEn: 'Lusaka', country: '赞比亚', province: '', lng: 28.28, lat: -15.39, tz: 2 },

  // ============================================================
  // AFRICA - Central
  // ============================================================
  { name: '金沙萨', nameEn: 'Kinshasa', country: '刚果(金)', province: '', lng: 15.31, lat: -4.32, tz: 1 },
  { name: '雅温得', nameEn: 'Yaounde', country: '喀麦隆', province: '', lng: 11.52, lat: 3.87, tz: 1 },
  { name: '利伯维尔', nameEn: 'Libreville', country: '加蓬', province: '', lng: 9.45, lat: 0.39, tz: 1 },

  // ============================================================
  // OCEANIA
  // ============================================================
  // Australia
  { name: '堪培拉', nameEn: 'Canberra', country: '澳大利亚', province: '', lng: 149.13, lat: -35.28, tz: 10 },
  { name: '悉尼', nameEn: 'Sydney', country: '澳大利亚', province: '', lng: 151.21, lat: -33.87, tz: 10 },
  { name: '墨尔本', nameEn: 'Melbourne', country: '澳大利亚', province: '', lng: 144.96, lat: -37.81, tz: 10 },
  { name: '布里斯班', nameEn: 'Brisbane', country: '澳大利亚', province: '', lng: 153.03, lat: -27.47, tz: 10 },
  { name: '珀斯', nameEn: 'Perth', country: '澳大利亚', province: '', lng: 115.86, lat: -31.95, tz: 8 },
  { name: '阿德莱德', nameEn: 'Adelaide', country: '澳大利亚', province: '', lng: 138.60, lat: -34.93, tz: 9.5 },
  { name: '达尔文', nameEn: 'Darwin', country: '澳大利亚', province: '', lng: 130.84, lat: -12.46, tz: 9.5 },
  { name: '霍巴特', nameEn: 'Hobart', country: '澳大利亚', province: '', lng: 147.33, lat: -42.88, tz: 10 },

  // New Zealand
  { name: '惠灵顿', nameEn: 'Wellington', country: '新西兰', province: '', lng: 174.78, lat: -41.29, tz: 12 },
  { name: '奥克兰', nameEn: 'Auckland', country: '新西兰', province: '', lng: 174.76, lat: -36.85, tz: 12 },
  { name: '基督城', nameEn: 'Christchurch', country: '新西兰', province: '', lng: 172.64, lat: -43.53, tz: 12 },

  // Pacific Islands
  { name: '苏瓦', nameEn: 'Suva', country: '斐济', province: '', lng: 178.44, lat: -18.14, tz: 12 },
  { name: '阿皮亚', nameEn: 'Apia', country: '萨摩亚', province: '', lng: -171.76, lat: -13.83, tz: 13 },
  { name: '努库阿洛法', nameEn: 'Nukualofa', country: '汤加', province: '', lng: -175.20, lat: -21.21, tz: 13 },
  { name: '莫尔兹比港', nameEn: 'Port Moresby', country: '巴布亚新几内亚', province: '', lng: 147.18, lat: -9.44, tz: 10 },
]
