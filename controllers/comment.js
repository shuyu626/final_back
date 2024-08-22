import User from '../models/user.js'
import Comment from '../models/comment.js'
import Material from '../models/material.js'
import { StatusCodes } from 'http-status-codes'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    console.log(req.body.materialId)
    const { materialId, content } = req.body
    const userId = req.user._id
    console.log(userId)
    console.log(content)
    if (!materialId || !content) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: '物資 ID 和留言內容是必需的' })
    }

    // 創建新留言
    const comment = new Comment({
      material: materialId,
      user: userId,
      content
    })

    await comment.save()

    const material = await Material.findById(materialId)
    if (!material) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '物資不存在' })
    }
    material.comment.push(comment._id) // 將新留言的 ID 添加到 comment 陣列中
    await material.save()

    // 查詢使用者並添加留言 ID
    const user = await User.findById(userId)
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: '使用者不存在' })
    }

    user.comment.push(comment._id) // 將新留言的 ID 添加到 comment 陣列中
    await user.save()

    res.status(StatusCodes.CREATED).json({
      success: true,
      comment
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
      {
        success: false,
        message: '未知錯誤'
      })
  }
}

export const getComments = async (req, res) => {
  try {
    const materialId = req.params.id
    console.log(materialId)

    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // 查詢留言並填充用戶和物資資訊
    const result = await Comment.find({ material: materialId })
      .populate('user', 'username avatar') // 填充用戶資訊
      .populate('material', 'name image') // 填充物資資訊
      .exec()

    // console.log(result)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '商品 ID 格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '查無留言'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '未知錯誤'
      })
    }
  }
}
