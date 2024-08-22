import Landmark from '../models/landmark.js'
import User from '../models/user.js'
import { StatusCodes } from 'http-status-codes'

// create 函式負責處理 POST 請求以創建新產品。它將從 req.file.path 中取得圖片，並將其存入 req.body.image 中，
// 將請求中的產品資料和上傳的圖片路徑儲存到數據庫中的 Landmark 模型中
export const create = async (req, res) => {
  try {
    console.log(req.body)
    req.body.user = req.user._id
    // console.log(req.body.user)

    // mongoose - Model.create() 用於創建新的資料並立即保存到資料庫。
    // 建立新的產品資料
    const result = await Landmark.create(req.body)

    // 把該活動id存到user裡
    await User.findByIdAndUpdate(req.body.user, { $push: { landmark: result._id } })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') { // 處理驗證錯誤
      const key = Object.keys(error.errors)[0] // 取得第一個錯誤的屬性名稱
      const message = error.errors[key].message // 取得錯誤訊息
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}

export const getAll = async (req, res) => {
  try {
    // 先從 request 中取得所需的參數(query)或使用預設值
    // 前面沒有的話就用 || 後面的預設值
    const sortBy = req.query.sortBy || 'createdAt' // 排序依據，預設為 createdAt
    const sortOrder = req.query.sortOrder || 'desc' // 排序方式，預設為降冪
    const itemsPerPage = req.query.itemsPerPage * 1 || 12 // 每頁顯示的項目數量，預設為 8(*1 文字轉數字)
    const page = req.query.page * 1 || 1 // 目前頁碼，預設為第 1 頁
    // 找文字要處理，不然只會找完全符合的
    // 建立正則表達式做模糊的查詢，''空的，i不分大小寫
    const regex = new RegExp(req.query.search || '', 'i') // 搜尋關鍵字，不區分大小寫
    const data = await Landmark
      .find({ // find放查詢條件
        $or: [ // 符合其中一個即可
          { name: regex },
          { tel: regex },
          { category: regex },
          { description: regex }
        ]
      })
      .sort({ [sortBy]: sortOrder }) // .sort({ 欄位:排序 })，[sortBy]當作key使用
      // 如果一頁有 10 筆
      // 第一頁 = 1 ~ 10 = 跳過 0 筆 = (第 1 頁 - 1) * 10 = 0
      // 第二頁 = 11 ~ 20 = 跳過 10 筆 = (第 2 頁 - 1) * 10 = 10
      // 第三頁 = 21 ~ 30 = 跳過 20 筆 = (第 3 頁 - 1) * 10 = 20
      .skip((page - 1) * itemsPerPage) // mongoDB 的分頁用 skip 跟 limit 去做，skip是要跳過幾筆資料，limit是要回傳幾筆
      .limit(itemsPerPage)
    // console.log(data)
    // mongoose 的 .estimatedDocumentCount() 計算資料總數
    const total = await Landmark.estimatedDocumentCount() // 取得產品總數
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data, total
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '未知錯誤'
    })
  }
}
