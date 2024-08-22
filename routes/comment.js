import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
// import admin from '../middlewares/admin.js'
import { create, getComments } from '../controllers/comment.js'

const router = Router()

router.post('/', auth.jwt, create)

router.get('/:id', auth.jwt, getComments)
export default router
