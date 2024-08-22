import { Router } from 'express'
import * as auth from '../middlewares/auth.js'

import { create, getAll, deleteId } from '../controllers/landmark.js'

const router = Router()

router.post('/', auth.jwt, create)
// 獲取所有地標
router.get('/', getAll)
// 刪除地標
router.delete('/:id', auth.jwt, deleteId)

export default router
