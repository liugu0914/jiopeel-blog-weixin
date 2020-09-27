/**
 * ------------------------------------------------------------------------
 *  工具类
 *  @author lyc
 *  @date 2020年06月04日17:48:50
 * ------------------------------------------------------------------------
 */
class Tool {
  // ----------------------------------------------------------------------
  // 获取form数据转为Object
  // form 为form的JQuery对象
  // ----------------------------------------------------------------------
  static formData(form) {
    if (!form || form.length === 0 || !$ || !$.fn) {
      return {}
    }
    const array = form.serializeArray()
    const data = {}
    for (const index in array) {
      if (!Object.prototype.hasOwnProperty.call(array, index)) {
        continue
      }
      const name = array[index].name
      const value = array[index].value
      data[name] = data[name] ? [...data[name] instanceof Array ? data[name] : [data[name]], value] : value
    }
    return data
  }

  // ----------------------------------------------------------------------
  // Object序列化
  // ----------------------------------------------------------------------
  static toSerialize(obj) {
    let serialize = ''
    if (!obj || !(obj instanceof Object)) {
      return serialize
    }
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        continue
      }
      let data = obj[key]

      if (data instanceof Array) {
        for (const index in data) {
          if (!Object.prototype.hasOwnProperty.call(data, index)) {
            continue
          }
          let value = data[index]
          value = encodeURIComponent(value)
          serialize = serialize ? serialize.concat(`&${key}=${value}`) : `${key}=${value}`
        }
      } else if (typeof data === 'object') {
        continue
      } else {
        data = encodeURIComponent(data)
        serialize = serialize ? serialize.concat(`&${key}=${data}`) : `${key}=${data}`
      }
    }
    return serialize
  }

  // ----------------------------------------------------------------------
  // 数组数据转为Object
  // ----------------------------------------------------------------------
  static toObject(target, ...needs) {
    if (!target) {
      return {}
    }
    if (!(target instanceof Array)) {
      return target
    }
    const data = {}
    let flag = false
    for (const index in target) {
      if (!Object.prototype.hasOwnProperty.call(target, index)) {
        continue
      }
      const targetData = target[index]
      if (typeof targetData !== 'object') {
        flag = true
        break
      }
      for (const key in targetData) {
        if (!Object.prototype.hasOwnProperty.call(targetData, key)) {
          continue
        }
        if (needs && needs.length > 0 && !needs.includes(key)) {
          continue
        }
        const value = targetData[key]
        data[key] = data[key] ? [...data[key] instanceof Array ? data[key] : [data[key]], value] : value
      }
    }
    return flag ? target : data
  }
  // ----------------------------------------------------------------------
  // 字符串转function
  // ----------------------------------------------------------------------
  static eval(value) {
    let args
    let fuc
    if (!value) {
      return fuc
    }
    const regval = value.match(/\(.*\)/gi)

    if (regval && regval instanceof Array && regval.length > 0) {
      const argstr = regval.pop()
      value = value.replace(argstr, '')
      args = argstr.replace(/\(|\)/g, '').split(';')
      args = args.filter((arg) => arg || arg === 0).map((arg) => JSON.parse(arg.replace(/'/g, '"')))
    }
    try {
      // eslint-disable-next-line no-new-func
      fuc = new Function(`return ${value}`)()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`the value [${value}] is not function`)
    }
    return args ? {
      args,
      fuc
    } : fuc
  }

  // ----------------------------------------------------------------------
  // 判断是否为JSON
  // ----------------------------------------------------------------------
  static isJSON(value) {
    value = typeof value === 'string' ? value : JSON.stringify(value)
    try {
      value = Object.prototype.toString.call(JSON.parse(value))
      if (value === '[object Object]' || value === '[object Array]') {
        return true
      }
      return false
    } catch (e) {
      return false
    }
  }


  // ----------------------------------------------------------------------
  //  ztree 简单数据 转 子孙节点数据
  // ----------------------------------------------------------------------
  static rebliud(sNodes, key, parentKey, childKey) {
    if (!key) {
      key = 'id'
    }
    if (!parentKey) {
      parentKey = 'pid'
    }
    if (!childKey) {
      childKey = 'children'
    }
    const result = []
    const tmpMap = {}

    // 先把数组整理成map的形式
    for (let i = 0, l = sNodes.length; i < l; i++) {
      // key为 对象的"id"的值， value就是就该对象
      tmpMap[sNodes[i][key]] = sNodes[i]
    }

    // 遍历，组织成子孙节点
    for (let i = 0, l = sNodes.length; i < l; i++) {
      // 查找当前节点的父节点是否存在，如果存在就把当前节点放入到父节点的子孙列表中
      if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] !== sNodes[i][parentKey]) {
        if (!tmpMap[sNodes[i][parentKey]][childKey]) {
          tmpMap[sNodes[i][parentKey]][childKey] = []
        }
        tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i])
      } else {
        // 如果不存在就直接放入到一个新的列表中
        result.push(sNodes[i])
      }
    }
    return result
  }

  // ----------------------------------------------------------------------
  // 替换html 使得在微信上可用
  // ----------------------------------------------------------------------
  static wxHtmlAble(htmlStr){
    if(!htmlStr || !htmlStr.trim() || typeof htmlStr !=='string'){
      return htmlStr
    }
    return htmlStr.replace(/figure/gi, 'div').replace(/<img([\s\w"-=\/\.:;]+)/ig, '<img$1 class="img"');
  }

  // ----------------------------------------------------------------------
  // 检查QQ格式
  // ----------------------------------------------------------------------
  static chkQQ(value) {
    const reg = /^[1-9][0-9]{4,10}$/
    return reg.test(value)
  }


  // ----------------------------------------------------------------------
  // 检查手机号格式
  // ----------------------------------------------------------------------
  static chkPhone(value) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(value)
  }

  // ----------------------------------------------------------------------
  // 检查座机电话格式
  // ----------------------------------------------------------------------
  static chkTel(value) {
    const reg = /\(?\d{3,4}[) -]?\d{8}/
    return reg.test(value)
  }

  // ----------------------------------------------------------------------
  // 检查邮箱格式
  // ----------------------------------------------------------------------
  static chkEmail(value) {
    const reg = /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+(\.[a-zA-Z]{2,4})+$/
    return reg.test(value)
  }

  // ----------------------------------------------------------------------
  // 检查http格式
  // ----------------------------------------------------------------------
  static chkHttp(value) {
    const reg = /^(?=^.{3,255}$)(http(s)?:\/\/)+(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/
    return reg.test(value)
  }

  // ----------------------------------------------------------------------
  // 检查url格式
  // ----------------------------------------------------------------------
  static chkUrl(value) {
    const reg = /^(?=^.{3,255}$)(http(s)?:\/\/)+(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*([?&]\w+=\w*)*$/
    return reg.test(value)
  }


  // ----------------------------------------------------------------------
  // 检查身份证格式
  // ----------------------------------------------------------------------
  static chkIdCard(idcode) {
    let code
    if (typeof idcode === 'number') {
      code = `${idcode}`
    } else if (typeof idcode === 'string') {
      code = idcode
    } else {
      return false
    }

    // 加权因子
    // eslint-disable-next-line no-magic-numbers
    const weightFactor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    // 校验码
    const checkCode = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    const lastNum = 17
    const last = idcode[lastNum] // 最后一位
    const seventeen = code.substring(0, lastNum)
    // ISO 7064:1983.MOD 11-2
    // 判断最后一位校验码是否正确
    const arr = seventeen.split('')
    const len = arr.length
    let num = 0
    for (let i = 0; i < len; i++) {
      num += arr[i] * weightFactor[i]
    }
    // 获取余数
    const resisueNum = 11
    const resisue = num % resisueNum
    const lastNo = checkCode[resisue]
    // 格式的正则
    // 正则思路
    /*
    第一位不可能是0
    第二位到第六位可以是0-9
    第七位到第十位是年份，所以七八位为19或者20
    十一位和十二位是月份，这两位是01-12之间的数值
    十三位和十四位是日期，是从01-31之间的数值
    十五，十六，十七都是数字0-9
    十八位可能是数字0-9，也可能是X
    */
    const idcardPatter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/
    // 判断格式是否正确
    const format = idcardPatter.test(idcode)
    // 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
    return last === lastNo && format
  }
}

export default Tool
